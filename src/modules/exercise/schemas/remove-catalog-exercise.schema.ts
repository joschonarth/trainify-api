import { z } from 'zod'

export const removeCatalogExerciseParamsSchema = z.object({
  id: z.string(),
})

export type RemoveCatalogExerciseParams = z.infer<
  typeof removeCatalogExerciseParamsSchema
>
