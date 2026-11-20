import { BadgeType } from 'generated/prisma'
import { z } from 'zod'

export const getAllBadgesQuerySchema = z.object({
  type: z.enum(BadgeType).optional(),
  unlocked: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional()
    .describe(
      'Filter by unlock status using exactly true or false. Omit to return both.'
    ),
})

export type GetAllBadgesQuery = z.infer<typeof getAllBadgesQuerySchema>
