import { z } from 'zod'

export const updateWeightGoalParamsSchema = z.object({
  goalId: z.string(),
})

export const updateWeightGoalBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  endDate: z.iso
    .datetime()
    .transform((value) => new Date(value))
    .nullable()
    .optional(),
})

export type UpdateWeightGoalParams = z.infer<
  typeof updateWeightGoalParamsSchema
>
export type UpdateWeightGoalBody = z.infer<typeof updateWeightGoalBodySchema>
