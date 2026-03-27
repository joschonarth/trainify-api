import { z } from 'zod'

export const getExerciseDetailsParamsSchema = z.object({
  id: z.cuid(),
})

export type GetExerciseDetailsParams = z.infer<
  typeof getExerciseDetailsParamsSchema
>
