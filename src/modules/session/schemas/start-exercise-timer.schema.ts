import { z } from 'zod'

export const startExerciseTimerParamsSchema = z.object({
  exerciseSessionId: z.cuid(),
})

export type StartExerciseTimerParams = z.infer<
  typeof startExerciseTimerParamsSchema
>
