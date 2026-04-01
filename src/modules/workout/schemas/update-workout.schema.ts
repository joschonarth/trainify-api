import { z } from 'zod'

export const updateWorkoutParamsSchema = z.object({
  workoutId: z.string(),
})

export const updateWorkoutBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
})

export type UpdateWorkoutParams = z.infer<typeof updateWorkoutParamsSchema>
export type UpdateWorkoutBody = z.infer<typeof updateWorkoutBodySchema>
