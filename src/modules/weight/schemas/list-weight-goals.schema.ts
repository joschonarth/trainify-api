import { z } from 'zod'

export const listWeightGoalsQuerySchema = z.object({
  status: z.enum(['active', 'completed']).optional(),
})

export type ListWeightGoalsQuery = z.infer<typeof listWeightGoalsQuerySchema>
