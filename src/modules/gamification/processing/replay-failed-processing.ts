import type { PrismaClient } from 'generated/prisma'
import { WORKOUT_FINALIZED_V1 } from '@/modules/session/events/workout-finalized-v1'

export async function replayFailedProcessing(
  db: PrismaClient,
  eventId: string,
  operator: string,
  reason: string
) {
  return await db.$transaction(async (transaction) => {
    const processing = await transaction.sessionEventProcessing.updateMany({
      where: { eventId, status: 'FAILED' },
      data: {
        status: 'PENDING',
        attempts: 0,
        leaseToken: null,
        leaseUntil: null,
        nextAttemptAt: null,
        lastError: null,
      },
    })
    if (processing.count !== 1) {
      throw new Error('Only failed processings can be replayed.')
    }
    const outbox = await transaction.sessionEventOutbox.updateMany({
      where: { eventId, type: WORKOUT_FINALIZED_V1 },
      data: {
        status: 'PENDING',
        nextAttemptAt: new Date(),
        publishedAt: null,
        leaseToken: null,
        leaseUntil: null,
        lastError: null,
      },
    })
    if (outbox.count !== 1) {
      throw new Error('Outbox event unavailable.')
    }
    await transaction.sessionEventProcessingReplay.create({
      data: { eventId, operator, reason },
    })
  })
}
