import { randomUUID } from 'node:crypto'
import { setTimeout as sleep } from 'node:timers/promises'
import {
  type ChannelModel,
  type ConfirmChannel,
  type ConsumeMessage,
  connect,
  type Options,
} from 'amqplib'

type PublicationFailure =
  | 'broker_disconnected'
  | 'confirm_timeout'
  | 'broker_nack'
  | 'unroutable'
export type PublicationResult = 'confirmed' | PublicationFailure

interface BrokerChannel {
  model: ChannelModel
  channel: ConfirmChannel
  returns: Set<string>
}

export class RabbitMqClient {
  private broker: BrokerChannel | undefined
  private readonly closing = new Map<ChannelModel, Promise<void>>()

  constructor(
    private readonly url: string,
    private readonly timeoutMs: number,
    private readonly declareTopology: (channel: ConfirmChannel) => Promise<void>
  ) {}

  get ready() {
    return this.broker !== undefined
  }

  async open() {
    if (this.broker) {
      return
    }

    const controller = new AbortController()
    const url = new URL(this.url)
    if (!url.searchParams.has('heartbeat')) {
      url.searchParams.set('heartbeat', '10')
    }
    const setup = this.connect(url.href, controller.signal)
    try {
      const broker = await Promise.race([
        setup,
        sleep(this.timeoutMs, undefined, { signal: controller.signal }).then(
          () => {
            throw new Error('Broker setup timed out')
          }
        ),
      ])
      this.broker = broker
    } finally {
      controller.abort()
    }
  }

  private async connect(
    url: string,
    signal: AbortSignal
  ): Promise<BrokerChannel> {
    const model = await connect(url, { timeout: this.timeoutMs })
    const forgetModel = () => {
      if (this.broker?.model === model) {
        this.broker = undefined
      }
    }
    model.on('error', forgetModel)
    model.on('close', forgetModel)
    const closeOnAbort = () => this.closeModel(model)
    signal.addEventListener('abort', closeOnAbort, { once: true })
    try {
      signal.throwIfAborted()
      const channel = await model.createConfirmChannel()
      const forgetChannel = () => {
        if (this.broker?.model === model) {
          this.reset()
        }
      }
      channel.on('error', forgetChannel)
      channel.on('close', forgetChannel)
      const returns = new Set<string>()
      channel.on('return', (message) => {
        const confirmId = message.properties.headers?.['x-trainify-confirm-id']
        if (typeof confirmId === 'string') {
          returns.add(confirmId)
        }
      })
      await this.declareTopology(channel)
      signal.throwIfAborted()
      return { model, channel, returns }
    } catch (error) {
      this.closeModel(model)
      throw error
    } finally {
      signal.removeEventListener('abort', closeOnAbort)
    }
  }

  private closeModel(model: ChannelModel) {
    if (this.closing.has(model)) {
      return
    }
    const close = new Promise<void>((resolve) => {
      const finish = () => {
        model.removeListener('close', finish)
        resolve()
      }
      // A lost socket can emit close without completing the AMQP close handshake.
      model.once('close', finish)
      model.close().then(finish, finish)
    })
    this.closing.set(model, close)
    close.then(() => this.closing.delete(model)).catch(() => undefined)
  }

  private reset() {
    const broker = this.broker
    this.broker = undefined
    if (broker) {
      this.closeModel(broker.model)
    }
  }

  async consume(
    queue: string,
    prefetch: number,
    handle: (channel: ConfirmChannel, message: ConsumeMessage | null) => void
  ) {
    const broker = this.broker
    if (!broker) {
      throw new Error('Broker unavailable')
    }
    const { channel } = broker
    await channel.prefetch(prefetch)
    const { consumerTag } = await channel.consume(
      queue,
      (message) => handle(channel, message),
      { noAck: false }
    )
    return { channel, consumerTag }
  }

  async publish(
    exchange: string,
    routingKey: string,
    body: unknown,
    properties: Pick<
      Options.Publish,
      'messageId' | 'correlationId' | 'type'
    > = {}
  ): Promise<PublicationResult> {
    const broker = this.broker
    if (!broker) {
      return 'broker_disconnected'
    }

    const controller = new AbortController()
    const confirmId = randomUUID()
    try {
      return await Promise.race([
        this.confirm(
          broker,
          exchange,
          routingKey,
          Buffer.from(JSON.stringify(body)),
          {
            ...properties,
            persistent: true,
            mandatory: true,
            contentType: 'application/json',
            headers: { 'x-trainify-confirm-id': confirmId },
          },
          confirmId
        ),
        sleep(this.timeoutMs, undefined, { signal: controller.signal }).then(
          () => {
            if (this.broker === broker) {
              this.reset()
            }
            return 'confirm_timeout' as const
          }
        ),
      ])
    } finally {
      controller.abort()
      broker.returns.delete(confirmId)
    }
  }

  private confirm(
    broker: BrokerChannel,
    exchange: string,
    routingKey: string,
    body: Buffer,
    options: Options.Publish,
    confirmId: string
  ) {
    return new Promise<PublicationResult>((resolve) => {
      try {
        broker.channel.publish(exchange, routingKey, body, options, (error) => {
          // RabbitMQ sends basic.return before the confirm for an unroutable message.
          if (broker.returns.has(confirmId)) {
            resolve('unroutable')
          } else if (error) {
            resolve(
              this.broker === broker ? 'broker_nack' : 'broker_disconnected'
            )
          } else {
            resolve('confirmed')
          }
        })
      } catch {
        if (this.broker === broker) {
          this.reset()
        }
        resolve('broker_disconnected')
      }
    })
  }

  async close() {
    this.reset()
    await Promise.all(this.closing.values())
  }
}
