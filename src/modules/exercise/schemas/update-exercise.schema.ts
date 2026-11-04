import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const updateExerciseParamsSchema = z.object({
  exerciseId: z.string(),
})

export const updateExerciseBodySchema = z.object({
  name: z.string().optional(),
  category: z.enum(ExerciseCategory).nullable().optional(),
  type: z.enum(ExerciseType).nullable().optional(),
})

export type UpdateExerciseParams = z.infer<typeof updateExerciseParamsSchema>
export type UpdateExerciseBody = z.infer<typeof updateExerciseBodySchema>
