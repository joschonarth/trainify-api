import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const createExerciseBodySchema = z.object({
  name: z.string(),
  category: z.enum(ExerciseCategory).nullable(),
  type: z.enum(ExerciseType).nullable(),
})

export type CreateExerciseBody = z.infer<typeof createExerciseBodySchema>
