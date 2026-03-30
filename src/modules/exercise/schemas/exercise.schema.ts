import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const exerciseSchema = z.object({
  id: z.string().describe('Exercise ID.'),
  name: z.string().describe('Exercise name.'),
  category: z.enum(ExerciseCategory).nullable().describe('Exercise category.'),
  type: z.enum(ExerciseType).nullable().describe('Exercise type.'),
  isCustom: z
    .boolean()
    .describe('Whether the exercise was created by the user.'),
  createdAt: z.date().describe('Exercise creation date.'),
  userId: z
    .string()
    .nullable()
    .describe('ID of the user who created the exercise.'),
})
