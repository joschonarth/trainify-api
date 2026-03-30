import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const fetchUserExercisesQuerySchema = z.object({
  query: z.string().optional().default(''),
  category: z.enum(ExerciseCategory).optional(),
  type: z.enum(ExerciseType).optional(),
})

export type FetchUserExercisesQuery = z.infer<
  typeof fetchUserExercisesQuerySchema
>
