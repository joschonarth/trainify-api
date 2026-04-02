import { z } from 'zod'

export const finishWorkoutSessionParamsSchema = z.object({
  sessionId: z.string().cuid(),
})

export type FinishWorkoutSessionParams = z.infer<
  typeof finishWorkoutSessionParamsSchema
>
