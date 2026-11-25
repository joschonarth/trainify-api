import type { PrismaClient } from 'generated/prisma'
import { badgeUnlockedV1Schema } from '@/modules/gamification/badge/events/badge-unlocked-v1'

export async function replayBadgeNotification(
  db: PrismaClient,
  eventId: string,
  operator: string,
  reason: string
) {
  await db.$transaction(async (transaction) => {
    const row = await transaction.badgeEventOutbox.findUnique({
      where: { eventId },
    })
    const parsed = badgeUnlockedV1Schema.safeParse(row?.envelope)
    if (
      !(row && parsed.success) ||
      parsed.data.eventId !== eventId ||
      parsed.data.type !== row.type ||
      parsed.data.data.userBadgeId !== row.userBadgeId
    ) {
      throw new Error('Badge outbox event is missing or invalid')
    }

    const updated = await transaction.badgeEventOutbox.updateMany({
      where: { eventId, status: 'PUBLISHED' },
      data: {
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: new Date(),
        leaseToken: null,
        leaseUntil: null,
        lastError: null,
        publishedAt: null,
      },
    })
    if (updated.count !== 1) {
      throw new Error('Badge outbox event is already pending')
    }

    await transaction.badgeNotificationDelivery.deleteMany({
      where: { eventId },
    })
    await transaction.badgeNotificationReplay.create({
      data: { eventId, operator, reason },
    })
  })
}
