import { z } from 'zod'

export const removeExerciseFromWorkoutParamsSchema = z.object({
  workoutId: z.string(),
  exerciseId: z.string(),
})

export type RemoveExerciseFromWorkoutParams = z.infer<
  typeof removeExerciseFromWorkoutParamsSchema
>
