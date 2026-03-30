import { z } from 'zod'

export const addExerciseFromCatalogParamsSchema = z.object({
  id: z.cuid(),
})

export type AddExerciseFromCatalogParams = z.infer<
  typeof addExerciseFromCatalogParamsSchema
>
