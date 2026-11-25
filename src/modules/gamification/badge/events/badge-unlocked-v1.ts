import { z } from 'zod'

export const BADGE_UNLOCKED_V1 = 'badge.unlocked.v1'

export const badgeUnlockedV1Schema = z.strictObject({
  eventId: z.uuid(),
  type: z.literal(BADGE_UNLOCKED_V1),
  occurredAt: z.iso.datetime(),
  correlationId: z.uuid(),
  data: z.strictObject({
    userId: z.string().min(1),
    userBadgeId: z.string().min(1),
    badgeId: z.string().min(1),
    badgeName: z.string(),
  }),
})

export type BadgeUnlockedV1 = z.infer<typeof badgeUnlockedV1Schema>
