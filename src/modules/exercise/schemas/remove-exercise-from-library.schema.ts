import { z } from 'zod'

export const removeExerciseFromLibraryParamsSchema = z.object({
  exerciseId: z.string(),
})

export type RemoveExerciseFromLibraryParams = z.infer<
  typeof removeExerciseFromLibraryParamsSchema
>
