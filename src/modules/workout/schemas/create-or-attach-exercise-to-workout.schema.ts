import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const createOrAttachExerciseToWorkoutParamsSchema = z.object({
  workoutId: z.string(),
})

export const createOrAttachExerciseToWorkoutBodySchema = z.object({
  name: z.string(),
  category: z.enum(ExerciseCategory).nullable(),
  type: z.enum(ExerciseType).nullable(),
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

export type CreateOrAttachExerciseToWorkoutParams = z.infer<
  typeof createOrAttachExerciseToWorkoutParamsSchema
>
export type CreateOrAttachExerciseToWorkoutBody = z.infer<
  typeof createOrAttachExerciseToWorkoutBodySchema
>
