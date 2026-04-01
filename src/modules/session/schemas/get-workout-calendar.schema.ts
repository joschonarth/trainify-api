import { z } from 'zod'

export const getWorkoutCalendarQuerySchema = z.object({
  month: z.coerce
    .number()
    .min(1)
    .max(12)
    .optional()
    .default(new Date().getMonth() + 1),
  year: z.coerce
    .number()
    .min(1970)
    .max(2100)
    .optional()
    .default(new Date().getFullYear()),
})

export type GetWorkoutCalendarQuery = z.infer<
  typeof getWorkoutCalendarQuerySchema
>
