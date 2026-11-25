import type { PrismaClient } from 'generated/prisma'
import type { BadgeUnlockedV1 } from '@/modules/gamification/badge/events/badge-unlocked-v1'

export class ProcessBadgeUnlocked {
  constructor(private readonly db: PrismaClient) {}

  async execute({ eventId, occurredAt, data }: BadgeUnlockedV1) {
    const [recipient] = await this.db.$queryRaw<{ id: string }[]>`
      SELECT id FROM users WHERE id = ${data.userId}
    `
    if (!recipient) {
      return 'user_not_found'
    }

    await this.db.notification.createMany({
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
  }
}
