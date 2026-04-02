import { z } from 'zod'

export const compareWorkoutExercisesParamsSchema = z.object({
  workoutId: z.cuid(),
})

export type CompareWorkoutExercisesParams = z.infer<
  typeof compareWorkoutExercisesParamsSchema
>
