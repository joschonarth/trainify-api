import { z } from 'zod'

export const getUserStreakLogsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type GetUserStreakLogsQuery = z.infer<
  typeof getUserStreakLogsQuerySchema
>
