import { z } from 'zod'

export const getUserStreakCalendarQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(1970).max(2100).optional(),
})

export type GetUserStreakCalendarQuery = z.infer<
  typeof getUserStreakCalendarQuerySchema
>
