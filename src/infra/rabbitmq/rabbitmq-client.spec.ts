import { EventEmitter } from 'node:events'
import { connect } from 'amqplib'
import { describe, expect, it, vi } from 'vitest'
import { RabbitMqClient } from './rabbitmq-client'

vi.mock('amqplib', () => ({ connect: vi.fn() }))

describe('RabbitMqClient', () => {
  it('reports a broker nack and closes when the socket ends before the close handshake', async () => {
    const model = Object.assign(new EventEmitter(), {
      close() {
        queueMicrotask(() => model.emit('close'))
        return new Promise<void>(() => undefined)
      },
    })
    const channel = Object.assign(new EventEmitter(), {
      publish: (
        _exchange: string,
        _routingKey: string,
        _body: Buffer,
        _options: unknown,
        confirm: (error: Error) => void
      ) => {
        confirm(new Error('nack from mock broker'))
        return true
      },
    })
    vi.mocked(connect).mockResolvedValue(
      Object.assign(model, {
        createConfirmChannel: vi.fn().mockResolvedValue(channel),
      }) as unknown as Awaited<ReturnType<typeof connect>>
    )

    const declareTopology = vi.fn().mockResolvedValue(undefined)
    const publisher = new RabbitMqClient(
      'amqp://localhost/trainify',
      5000,
      declareTopology
    )
    await publisher.open()
    try {
      expect(declareTopology).toHaveBeenCalledExactlyOnceWith(channel)
      await expect(
        publisher.publish(
          'test.exchange',
          'test.message',
          { value: 42 },
          {
            messageId: 'test-id',
          }
        )
      ).resolves.toBe('broker_nack')
    } finally {
      await publisher.close()
    }
    expect(publisher.ready).toBe(false)
  })
})
