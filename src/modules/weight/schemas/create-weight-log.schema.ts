import { z } from 'zod'

export const createWeightLogBodySchema = z.object({
  weight: z.number(),
  note: z.string().nullable().optional(),
})

export type CreateWeightLogBody = z.infer<typeof createWeightLogBodySchema>
