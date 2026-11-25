import { randomUUID } from 'node:crypto'
import type { Badge, Prisma } from 'generated/prisma'
import { BADGE_UNLOCKED_V1, type BadgeUnlockedV1 } from './badge-unlocked-v1'

export async function enqueueBadgeUnlockedEvents(
  transaction: Prisma.TransactionClient,
  userId: string,
  correlationId: string,
  badges: Badge[]
) {
  if (badges.length === 0) {
    return
  }

  const grants = await transaction.userBadge.findMany({
    where: { userId, badgeId: { in: badges.map(({ id }) => id) } },
    select: { id: true, badgeId: true, unlockedAt: true },
  })
  const grantsByBadgeId = new Map(grants.map((grant) => [grant.badgeId, grant]))

  await transaction.badgeEventOutbox.createMany({
    data: badges.map((badge) => {
      const grant = grantsByBadgeId.get(badge.id)
      if (!grant) {
        throw new Error('Newly unlocked badge grant was not found')
      }

      const envelope: BadgeUnlockedV1 = {
        eventId: randomUUID(),
        type: BADGE_UNLOCKED_V1,
        occurredAt: grant.unlockedAt.toISOString(),
        correlationId,
        data: {
          userId,
          userBadgeId: grant.id,
          badgeId: grant.badgeId,
          badgeName: badge.name,
        },
      }
      return {
        eventId: envelope.eventId,
        type: envelope.type,
        userBadgeId: grant.id,
        envelope,
      }
    }),
  })
}
