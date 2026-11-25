import { randomUUID } from 'node:crypto'
import type { PrismaClient } from 'generated/prisma'
import type { BadgeUnlockedV1 } from '@/modules/gamification/badge/events/badge-unlocked-v1'

export class ProcessBadgeUnlocked {
  constructor(
    private readonly db: PrismaClient,
    private readonly config: { maxAttempts: number; retryMs: number }
  ) {}

  async execute({ eventId, occurredAt, data }: BadgeUnlockedV1) {
    const where = { recipientId_eventId: { recipientId: data.userId, eventId } }
    if (
      await this.db.notification.findUnique({ where, select: { id: true } })
    ) {
      return 'completed'
    }

    const token = randomUUID()
    const [attempt] = await this.db.$queryRaw<{ attempts: number }[]>`
      INSERT INTO badge_notification_deliveries
        ("eventId", attempts, "attemptToken", "nextAttemptAt")
      VALUES (${eventId}::uuid, 1, ${token}::uuid,
        clock_timestamp() + ${this.config.retryMs} * interval '1 millisecond')
      ON CONFLICT ("eventId") DO UPDATE
      SET attempts = badge_notification_deliveries.attempts + 1,
          "attemptToken" = EXCLUDED."attemptToken",
          "nextAttemptAt" = clock_timestamp() + ${this.config.retryMs} * interval '1 millisecond'
      WHERE badge_notification_deliveries.failure IS NULL
        AND badge_notification_deliveries.attempts < ${this.config.maxAttempts}
        AND badge_notification_deliveries."nextAttemptAt" <= clock_timestamp()
      RETURNING attempts
    `

    try {
      return await this.db.$transaction(async (transaction) => {
        const [delivery] = await transaction.$queryRaw<
          {
            attemptToken: string
            attempts: number
            failure: string | null
            due: boolean
          }[]
        >`
          SELECT "attemptToken", attempts, failure, "nextAttemptAt" <= clock_timestamp() AS due
          FROM badge_notification_deliveries WHERE "eventId" = ${eventId}::uuid
          FOR UPDATE
        `
        if (
          await transaction.notification.findUnique({
            where,
            select: { id: true },
          })
        ) {
          return 'completed'
        }
        if (!delivery) {
          return 'waiting'
        }
        if (delivery.failure === 'user_not_found') {
          return 'user_not_found'
        }
        if (delivery.failure === 'attempts_exhausted') {
          return 'attempts_exhausted'
        }
        if (!attempt || delivery.attemptToken !== token) {
          if (delivery.due && delivery.attempts >= this.config.maxAttempts) {
            await transaction.badgeNotificationDelivery.update({
              where: { eventId },
              data: { failure: 'attempts_exhausted' },
            })
            return 'attempts_exhausted'
          }
          return 'waiting'
        }

        const [recipient] = await transaction.$queryRaw<{ id: string }[]>`
          SELECT id FROM users WHERE id = ${data.userId} FOR KEY SHARE
        `
        if (!recipient) {
          await transaction.badgeNotificationDelivery.update({
            where: { eventId },
            data: { failure: 'user_not_found' },
          })
          return 'user_not_found'
        }

        await transaction.notification.createMany({
          skipDuplicates: true,
          data: {
            eventId,
            recipientId: data.userId,
            type: 'BADGE_UNLOCKED',
            data: {
              badgeId: data.badgeId,
              badgeName: data.badgeName,
              unlockedAt: occurredAt,
            },
          },
        })
        return 'completed'
      })
    } catch (error) {
      if (!attempt) {
        throw error
      }
      return 'retry_scheduled'
    }
  }
}
