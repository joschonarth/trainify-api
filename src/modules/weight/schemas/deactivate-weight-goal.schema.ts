import { z } from 'zod'

export const deactivateWeightGoalParamsSchema = z.object({
  goalId: z.string(),
})

export type DeactivateWeightGoalParams = z.infer<
  typeof deactivateWeightGoalParamsSchema
>
