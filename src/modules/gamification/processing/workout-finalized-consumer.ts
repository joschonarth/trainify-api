import { setTimeout as sleep } from 'node:timers/promises'
import type { ConfirmChannel, ConsumeMessage } from 'amqplib'
import type { FastifyBaseLogger } from 'fastify'
import type { RabbitSessionEventPublisher } from '@/modules/session/events/publisher/rabbit-session-event-publisher'
import { workoutFinalizedV1Schema } from '@/modules/session/events/workout-finalized-v1'
import type { ProcessWorkoutFinalized } from './process-workout-finalized'

function decode(message: ConsumeMessage): unknown {
  try {
    return JSON.parse(message.content.toString('utf8'))
  } catch {
    return null
  }
}

export class WorkoutFinalizedConsumer {
  private subscribed = false

  constructor(
    private readonly broker: Pick<
      RabbitSessionEventPublisher,
      'ready' | 'open' | 'close' | 'consume' | 'publishDeadLetter'
    >,
    private readonly handler: Pick<ProcessWorkoutFinalized, 'execute'>,
    private readonly log: Pick<FastifyBaseLogger, 'warn' | 'error'>,
    private readonly config: { prefetch: number; pollMs: number }
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
                this.log.error('Workout event delivery interrupted')
                cycle.abort()
              }
            )
            inFlight.add(task)
            task.then(() => inFlight.delete(task)).catch(() => undefined)
          }
        )
        this.subscribed = true
        while (!signal.aborted && this.broker.ready) {
          await this.wait(signal)
        }
        if (this.broker.ready && stop.aborted) {
          await channel.cancel(consumerTag)
        }
      } catch {
        this.log.warn('Workout event consumer connection unavailable')
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
    const parsed = workoutFinalizedV1Schema.safeParse(decode(message))
    const event =
      parsed.success && parsed.data.eventId === message.properties.messageId
        ? parsed.data
        : undefined
    const fields = {
      eventId: event?.eventId,
      sessionId: event?.data.sessionId,
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
        this.log.warn(fields, 'Workout event processing will retry')
      } else if (outcome !== 'waiting') {
        const sent = await this.broker.publishDeadLetter(
          outcome,
          outcome === 'invalid_event' ? undefined : event
        )
        if (sent === 'confirmed') {
          channel.ack(message)
          this.log.warn(
            { ...fields, reason: outcome },
            'Workout event sent to dead-letter queue'
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
}
