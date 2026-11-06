import { z } from 'zod'

export const removeCatalogExerciseParamsSchema = z.object({
  exerciseId: z.string(),
})

export type RemoveCatalogExerciseParams = z.infer<
  typeof removeCatalogExerciseParamsSchema
>
