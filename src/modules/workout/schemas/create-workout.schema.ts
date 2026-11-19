import { z } from 'zod'

export const createWorkoutBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().nullable().optional(),
})

export type CreateWorkoutBody = z.infer<typeof createWorkoutBodySchema>
