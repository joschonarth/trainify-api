import { z } from 'zod'

export const compareWorkoutsQuerySchema = z.object({
  period: z.enum(['week', 'month']).optional().default('week'),
})

export type CompareWorkoutsQuery = z.infer<typeof compareWorkoutsQuerySchema>
