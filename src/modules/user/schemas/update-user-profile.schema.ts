import { z } from 'zod'

export const updateUserProfileBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  height: z.number().int().min(50).max(260).optional(),
  weight: z.number().min(20).max(500).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthdate: z.iso
    .date()
    .refine((birthdate) => birthdate <= new Date().toISOString().slice(0, 10), {
      error: 'Birthdate cannot be in the future.',
    })
    .optional(),
})

export type UpdateUserProfileBody = z.infer<typeof updateUserProfileBodySchema>
