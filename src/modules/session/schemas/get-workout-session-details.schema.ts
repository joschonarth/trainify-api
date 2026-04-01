import { z } from 'zod'

export const getWorkoutSessionDetailsParamsSchema = z.object({
  sessionId: z.string(),
})

export type GetWorkoutSessionDetailsParams = z.infer<
  typeof getWorkoutSessionDetailsParamsSchema
>
