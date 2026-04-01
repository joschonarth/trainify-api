import { z } from 'zod'

export const compareWorkoutSessionsParamsSchema = z.object({
  workoutId: z.cuid(),
})

export type CompareWorkoutSessionsParams = z.infer<
  typeof compareWorkoutSessionsParamsSchema
>
