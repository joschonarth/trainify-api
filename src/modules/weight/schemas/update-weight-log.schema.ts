import { z } from 'zod'

export const updateWeightLogParamsSchema = z.object({
  logId: z.string(),
})

export const updateWeightLogBodySchema = z.object({
  weight: z.number().optional(),
  note: z.string().nullable().optional(),
})

export type UpdateWeightLogParams = z.infer<typeof updateWeightLogParamsSchema>
export type UpdateWeightLogBody = z.infer<typeof updateWeightLogBodySchema>
