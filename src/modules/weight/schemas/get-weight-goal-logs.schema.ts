import { z } from 'zod'

export const getWeightGoalLogsParamsSchema = z.object({
  goalId: z.string(),
})

export type GetWeightGoalLogsParams = z.infer<
  typeof getWeightGoalLogsParamsSchema
>
