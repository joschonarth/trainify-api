import { z } from 'zod'

export const getWeightGoalParamsSchema = z.object({
  goalId: z.string(),
})

export type GetWeightGoalParams = z.infer<typeof getWeightGoalParamsSchema>
