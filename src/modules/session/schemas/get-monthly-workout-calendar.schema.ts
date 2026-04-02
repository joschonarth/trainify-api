import { z } from 'zod'

export const getMonthlyWorkoutCalendarQuerySchema = z.object({
  year: z.coerce.number().min(1970).max(2100).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
})

export type GetMonthlyWorkoutCalendarQuery = z.infer<
  typeof getMonthlyWorkoutCalendarQuerySchema
>
