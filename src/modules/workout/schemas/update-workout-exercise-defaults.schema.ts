import { z } from 'zod'

export const updateWorkoutExerciseDefaultsParamsSchema = z.object({
  workoutId: z.string(),
  exerciseId: z.string(),
})

export const updateWorkoutExerciseDefaultsBodySchema = z.object({
  defaultSets: z.number().int().positive().nullable(),
  defaultReps: z.number().int().positive().nullable(),
  defaultWeight: z.number().finite().nonnegative().nullable(),
})

export type UpdateWorkoutExerciseDefaultsParams = z.infer<
  typeof updateWorkoutExerciseDefaultsParamsSchema
>
export type UpdateWorkoutExerciseDefaultsBody = z.infer<
  typeof updateWorkoutExerciseDefaultsBodySchema
>
