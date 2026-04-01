import { BadgeType } from 'generated/prisma'
import { z } from 'zod'

export const getAllBadgesQuerySchema = z.object({
  type: z.enum(BadgeType).optional(),
  unlocked: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
})

export type GetAllBadgesQuery = z.infer<typeof getAllBadgesQuerySchema>
