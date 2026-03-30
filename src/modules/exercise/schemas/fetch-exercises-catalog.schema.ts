import { ExerciseCategory } from 'generated/prisma'
import { z } from 'zod'

export const fetchExercisesCatalogQuerySchema = z.object({
  query: z.string().optional().default(''),
  category: z.enum(ExerciseCategory).optional(),
  page: z.coerce.number().min(1).default(1),
})

export type FetchExercisesCatalogQuery = z.infer<
  typeof fetchExercisesCatalogQuerySchema
>
