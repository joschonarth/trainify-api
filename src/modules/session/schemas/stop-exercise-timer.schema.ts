import { z } from 'zod'

export const stopExerciseTimerParamsSchema = z.object({
  exerciseSessionId: z.cuid(),
})

export type StopExerciseTimerParams = z.infer<
  typeof stopExerciseTimerParamsSchema
>
