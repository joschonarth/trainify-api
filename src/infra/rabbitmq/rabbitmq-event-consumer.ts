import { setTimeout as sleep } from 'node:timers/promises'
import type { ConfirmChannel, ConsumeMessage } from 'amqplib'
import type { FastifyBaseLogger } from 'fastify'
import type { RabbitMqClient } from './rabbitmq-client'

function decode(message: ConsumeMessage): unknown {
  try {
    return JSON.parse(message.content.toString('utf8'))
  } catch {
    return null
  }
}

interface EventEnvelope {
  eventId: string
  correlationId: string
  type: string
}

type ConsumptionOutcome =
  | 'completed'
  | 'waiting'
  | 'retry_scheduled'
  | 'invalid_event'
  | 'attempts_exhausted'
  | 'user_not_found'

export class RabbitMqEventConsumer<Event extends EventEnvelope> {
  private subscribed = false

  constructor(
    private readonly broker: Pick<
      RabbitMqClient,
      'ready' | 'open' | 'close' | 'consume' | 'publish'
    >,
    private readonly handler: {
      execute(event: Event): Promise<ConsumptionOutcome>
    },
    private readonly log: Pick<FastifyBaseLogger, 'warn' | 'error'> &
      Partial<Pick<FastifyBaseLogger, 'info'>>,
    private readonly config: {
      prefetch: number
      pollMs: number
      queue: string
      dlq: string
      schema: {
        safeParse(
          value: unknown
        ): { success: true; data: Event } | { success: false }
      }
      depthPollMs?: number
    }
  ) {}

  get ready() {
    return this.subscribed && this.broker.ready
  }

  async run(stop: AbortSignal) {
    while (!stop.aborted) {
      const cycle = new AbortController()
      const inFlight = new Set<Promise<void>>()
      const signal = AbortSignal.any([stop, cycle.signal])
      try {
        await this.broker.open()
        if (stop.aborted) {
          return
        }
        const { channel, consumerTag } = await this.broker.consume(
          this.config.queue,
          this.config.prefetch,
          (deliveryChannel, message) => {
            if (!message) {
              cycle.abort()
              return
            }
            if (signal.aborted) {
              return
            }
            const task = this.handle(deliveryChannel, message, signal).catch(
              () => {
                this.log.error('RabbitMQ event delivery interrupted')
                cycle.abort()
              }
            )
            inFlight.add(task)
            task.then(() => inFlight.delete(task)).catch(() => undefined)
          }
        )
        this.subscribed = true
        let nextDepthCheck = Date.now()
        while (!signal.aborted && this.broker.ready) {
          if (this.config.depthPollMs && Date.now() >= nextDepthCheck) {
            const { messageCount } = await channel.checkQueue(this.config.dlq)
            this.log.info?.(
              { queue: this.config.dlq, messageCount },
              'Dead-letter queue depth'
            )
            nextDepthCheck = Date.now() + this.config.depthPollMs
          }
          await this.wait(signal)
        }
        if (this.broker.ready && stop.aborted) {
          await channel.cancel(consumerTag)
        }
      } catch {
        this.log.warn('RabbitMQ event consumer connection unavailable')
      } finally {
        this.subscribed = false
        cycle.abort()
        await Promise.all(inFlight)
        await this.broker.close()
      }
      await this.wait(stop)
    }
  }

  private wait(signal: AbortSignal) {
    return sleep(this.config.pollMs, undefined, { signal }).catch(
      () => undefined
    )
  }

  private async handle(
    channel: ConfirmChannel,
    message: ConsumeMessage,
    signal: AbortSignal
  ) {
    const parsed = this.config.schema.safeParse(decode(message))
    const event =
      parsed.success && parsed.data.eventId === message.properties.messageId
        ? parsed.data
        : undefined
    const fields = {
      eventId: event?.eventId,
      queue: this.config.queue,
      correlationId: event?.correlationId,
    }
    while (!signal.aborted && this.broker.ready) {
      const outcome = event
        ? await this.handler.execute(event)
        : 'invalid_event'
      if (outcome === 'completed') {
        channel.ack(message)
        return
      }
      if (outcome === 'retry_scheduled') {
        this.log.warn(fields, 'RabbitMQ event processing will retry')
      } else if (outcome !== 'waiting') {
        const sent = await this.publishDeadLetter(
          outcome,
          outcome === 'invalid_event' ? undefined : event
        )
        if (sent === 'confirmed') {
          channel.ack(message)
          this.log.warn(
            { ...fields, reason: outcome },
            'RabbitMQ event sent to dead-letter queue'
          )
          return
        }
        this.log.warn(
          { ...fields, reason: sent },
          'Dead-letter transfer will retry'
        )
      }
      // Keep the original unsettled during retry and until a DLQ publication is confirmed.
      await this.wait(signal)
    }
  }

  private publishDeadLetter(reason: string, event?: Event) {
    return this.broker.publish(
      '',
      this.config.dlq,
      { reason, event },
      event
        ? {
            messageId: event.eventId,
            correlationId: event.correlationId,
            type: event.type,
          }
        : {}
    )
  }
}
