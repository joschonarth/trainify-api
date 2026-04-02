import { z } from 'zod'

export const completeExerciseSessionParamsSchema = z.object({
  exerciseSessionId: z.cuid(),
})

export type CompleteExerciseSessionParams = z.infer<
  typeof completeExerciseSessionParamsSchema
>
