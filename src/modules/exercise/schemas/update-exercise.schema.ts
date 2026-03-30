import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const updateExerciseParamsSchema = z.object({
  exerciseId: z.string(),
})

export const updateExerciseBodySchema = z.object({
  name: z.string().optional(),
  category: z.enum(ExerciseCategory).optional(),
  type: z.enum(ExerciseType).optional(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  weight: z.number().optional(),
})

export type UpdateExerciseParams = z.infer<typeof updateExerciseParamsSchema>
export type UpdateExerciseBody = z.infer<typeof updateExerciseBodySchema>
