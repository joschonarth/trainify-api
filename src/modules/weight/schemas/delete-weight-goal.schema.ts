import { z } from 'zod'

export const deleteWeightGoalParamsSchema = z.object({
  goalId: z.string(),
})

export type DeleteWeightGoalParams = z.infer<
  typeof deleteWeightGoalParamsSchema
>
