import { z } from 'zod'

export const addExerciseToWorkoutParamsSchema = z.object({
  workoutId: z.string(),
})

export const addExerciseToWorkoutBodySchema = z.object({
  exerciseId: z.string(),
  defaultSets: z.number().int().positive().nullable(),
  defaultReps: z.number().int().positive().nullable(),
  defaultWeight: z.number().finite().nonnegative().nullable(),
})

export type AddExerciseToWorkoutParams = z.infer<
  typeof addExerciseToWorkoutParamsSchema
>
export type AddExerciseToWorkoutBody = z.infer<
  typeof addExerciseToWorkoutBodySchema
>
