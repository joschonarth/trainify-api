import { z } from 'zod'

export const updateWorkoutExerciseDefaultsParamsSchema = z.object({
  workoutId: z.string(),
  exerciseId: z.string(),
})

export const updateWorkoutExerciseDefaultsBodySchema = z.object({
  defaultSets: z.number().nullable(),
  defaultReps: z.number().nullable(),
  defaultWeight: z.number().nullable(),
})

export type UpdateWorkoutExerciseDefaultsParams = z.infer<
  typeof updateWorkoutExerciseDefaultsParamsSchema
>
export type UpdateWorkoutExerciseDefaultsBody = z.infer<
  typeof updateWorkoutExerciseDefaultsBodySchema
>
