import { z } from 'zod'

export const createWeightLogBodySchema = z.object({
  weight: z.number(),
  note: z.string().nullable().optional(),
  date: z.iso
    .datetime()
    .transform((value) => new Date(value))
    .optional(),
})

export type CreateWeightLogBody = z.infer<typeof createWeightLogBodySchema>
