import type { ConfirmChannel, ConsumeMessage } from 'amqplib'
import { describe, expect, it, vi } from 'vitest'
import type { RabbitSessionEventPublisher } from '@/modules/session/events/publisher/rabbit-session-event-publisher'
import { WorkoutFinalizedConsumer } from './workout-finalized-consumer'

describe('WorkoutFinalizedConsumer', () => {
  it('keeps a malformed delivery unacknowledged until the DLQ accepts it', async () => {
    const channel = {
      ack: vi.fn(),
      cancel: vi.fn().mockResolvedValue(undefined),
    } as unknown as ConfirmChannel
    const incoming = {
      content: Buffer.from('invalid JSON'),
      properties: {},
    } as ConsumeMessage
    const pendingConfirm = Promise.withResolvers<'confirmed'>()
    const deadLetter = vi
      .fn()
      .mockResolvedValueOnce('unroutable')
      .mockReturnValueOnce(pendingConfirm.promise)
    const broker = {
      ready: true,
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      consume: (
        _prefetch: number,
        handle: Parameters<RabbitSessionEventPublisher['consume']>[1]
      ) => {
        handle(channel, incoming)
        return Promise.resolve({ channel, consumerTag: 'test' })
      },
      publishDeadLetter: deadLetter,
    }
    const handler = { execute: vi.fn() }
    const consumer = new WorkoutFinalizedConsumer(
      broker,
      handler,
      { warn: vi.fn(), error: vi.fn() },
      { prefetch: 1, pollMs: 1 }
    )
    const stop = new AbortController()
    const running = consumer.run(stop.signal)
    try {
      await vi.waitFor(() => expect(deadLetter).toHaveBeenCalledTimes(2))
      expect(deadLetter).toHaveBeenCalledWith('invalid_event', undefined)
      expect(handler.execute).not.toHaveBeenCalled()
      expect(channel.ack).not.toHaveBeenCalled()
      pendingConfirm.resolve('confirmed')
      await vi.waitFor(() =>
        expect(channel.ack).toHaveBeenCalledExactlyOnceWith(incoming)
      )
    } finally {
      pendingConfirm.resolve('confirmed')
      stop.abort()
      await running
    }
  })
})
