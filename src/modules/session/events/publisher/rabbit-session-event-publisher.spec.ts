import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { connect } from 'amqplib'
import { describe, expect, it, vi } from 'vitest'
import { WORKOUT_FINALIZED_V1 } from '../workout-finalized-v1'
import { RabbitSessionEventPublisher } from './rabbit-session-event-publisher'

vi.mock('amqplib', () => ({ connect: vi.fn() }))

describe('RabbitSessionEventPublisher', () => {
  it('reports a broker nack and closes when the socket ends before the close handshake', async () => {
    const model = Object.assign(new EventEmitter(), {
      close() {
        queueMicrotask(() => model.emit('close'))
        return new Promise<void>(() => undefined)
      },
    })
    const channel = Object.assign(new EventEmitter(), {
      assertExchange: vi.fn().mockResolvedValue(undefined),
      assertQueue: vi.fn().mockResolvedValue(undefined),
      bindQueue: vi.fn().mockResolvedValue(undefined),
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

    const publisher = new RabbitSessionEventPublisher(
      'amqp://localhost/trainify',
      5000
    )
    await publisher.open()
    try {
      const now = '2026-11-23T12:00:00.000Z'
      await expect(
        publisher.publish({
          eventId: randomUUID(),
          type: WORKOUT_FINALIZED_V1,
          correlationId: randomUUID(),
          occurredAt: now,
          data: {
            sessionId: 'session',
            userId: 'user',
            status: 'COMPLETED',
            hasActivity: true,
            completedAt: now,
            businessDate: '2026-11-23',
            timezone: 'UTC',
          },
        })
      ).resolves.toBe('broker_nack')
    } finally {
      await publisher.close()
    }
    expect(publisher.ready).toBe(false)
  })
})
