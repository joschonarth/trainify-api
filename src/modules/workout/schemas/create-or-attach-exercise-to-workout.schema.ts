import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const createOrAttachExerciseToWorkoutParamsSchema = z.object({
  workoutId: z.string(),
})

export const createOrAttachExerciseToWorkoutBodySchema = z.object({
  name: z.string(),
  category: z.enum(ExerciseCategory).nullable(),
  type: z.enum(ExerciseType).nullable(),
  sets: z.number().nullable(),
  reps: z.number().nullable(),
  weight: z.number().nullable(),
})

export type CreateOrAttachExerciseToWorkoutParams = z.infer<
  typeof createOrAttachExerciseToWorkoutParamsSchema
>
export type CreateOrAttachExerciseToWorkoutBody = z.infer<
  typeof createOrAttachExerciseToWorkoutBodySchema
>
