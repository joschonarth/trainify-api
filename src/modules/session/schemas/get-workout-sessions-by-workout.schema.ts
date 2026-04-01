import { z } from 'zod'

export const getWorkoutSessionsByWorkoutParamsSchema = z.object({
  workoutId: z.cuid(),
})

export type GetWorkoutSessionsByWorkoutParams = z.infer<
  typeof getWorkoutSessionsByWorkoutParamsSchema
>
