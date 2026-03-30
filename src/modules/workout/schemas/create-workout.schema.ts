import { z } from 'zod'

export const createWorkoutBodySchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
})

export type CreateWorkoutBody = z.infer<typeof createWorkoutBodySchema>
