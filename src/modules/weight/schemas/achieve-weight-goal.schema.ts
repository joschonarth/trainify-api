import { z } from 'zod'

export const achieveWeightGoalParamsSchema = z.object({
  goalId: z.string(),
})

export type AchieveWeightGoalParams = z.infer<
  typeof achieveWeightGoalParamsSchema
>
