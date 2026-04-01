import { z } from 'zod'

export const fetchWorkoutSchedulesParamsSchema = z.object({
  workoutId: z.string(),
})

export type FetchWorkoutSchedulesParams = z.infer<
  typeof fetchWorkoutSchedulesParamsSchema
>
