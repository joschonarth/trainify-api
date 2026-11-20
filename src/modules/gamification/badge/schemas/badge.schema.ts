import { BadgeType } from 'generated/prisma'
import { z } from 'zod'

export const badgeSchema = z.object({
  id: z.string().describe('Badge ID.'),
  name: z.string().describe('Badge name.'),
  description: z.string().describe('Badge description.'),
  type: z.enum(BadgeType).describe('Badge type.'),
  milestone: z
    .number()
    .nullable()
    .describe('Milestone required to unlock the badge.'),
  createdAt: z.date().describe('Badge creation date.'),
  unlocked: z
    .boolean()
    .describe('Whether the badge has been unlocked by the user.'),
  unlockedAt: z.date().optional().describe('Date the badge was unlocked.'),
})
