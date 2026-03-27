import { z } from 'zod'

export const updateUserProfileBodySchema = z.object({
  name: z.string().optional(),
  height: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthdate: z.string().optional(),
})

export type UpdateUserProfileBody = z.infer<typeof updateUserProfileBodySchema>
