import { z } from 'zod'

export const updateWorkoutExerciseDefaultsParamsSchema = z.object({
  workoutId: z.string(),
  exerciseId: z.string(),
})

export const updateWorkoutExerciseDefaultsBodySchema = z.object({
  defaultSets: z.number().int().positive().nullable(),
  defaultReps: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe(
      'Planned repetitions per set for REPS; positive integer seconds per set for DURATION.'
    ),
  defaultWeight: z.number().finite().nonnegative().nullable(),
})

export type UpdateWorkoutExerciseDefaultsParams = z.infer<
  typeof updateWorkoutExerciseDefaultsParamsSchema
>
export type UpdateWorkoutExerciseDefaultsBody = z.infer<
  typeof updateWorkoutExerciseDefaultsBodySchema
>
