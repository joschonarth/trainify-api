import { z } from 'zod'

export const getExerciseSessionDetailsParamsSchema = z.object({
  exerciseSessionId: z.string(),
})

export type GetExerciseSessionDetailsParams = z.infer<
  typeof getExerciseSessionDetailsParamsSchema
>
