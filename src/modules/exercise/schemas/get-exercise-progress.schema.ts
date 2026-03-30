import { z } from 'zod'

export const getExerciseProgressParamsSchema = z.object({
  exerciseId: z.cuid(),
})

export type GetExerciseProgressParams = z.infer<
  typeof getExerciseProgressParamsSchema
>
