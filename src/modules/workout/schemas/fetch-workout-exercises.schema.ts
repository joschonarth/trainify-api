import { z } from 'zod'

export const fetchWorkoutExercisesParamsSchema = z.object({
  workoutId: z.string(),
})

export type FetchWorkoutExercisesParams = z.infer<
  typeof fetchWorkoutExercisesParamsSchema
>
