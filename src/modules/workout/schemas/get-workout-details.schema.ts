import { z } from 'zod'

export const getWorkoutDetailsParamsSchema = z.object({
  workoutId: z.string(),
})

export type GetWorkoutDetailsParams = z.infer<
  typeof getWorkoutDetailsParamsSchema
>
