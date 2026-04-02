import { z } from 'zod'

export const startWorkoutSessionParamsSchema = z.object({
  sessionId: z.cuid(),
})

export type StartWorkoutSessionParams = z.infer<
  typeof startWorkoutSessionParamsSchema
>
