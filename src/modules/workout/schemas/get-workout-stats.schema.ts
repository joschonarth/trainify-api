import { z } from 'zod'

export const getWorkoutStatsParamsSchema = z.object({
  workoutId: z.cuid(),
})

export type GetWorkoutStatsParams = z.infer<typeof getWorkoutStatsParamsSchema>
