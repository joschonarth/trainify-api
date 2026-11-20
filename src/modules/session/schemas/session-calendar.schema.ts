import { z } from 'zod'

export const calendarDaySchema = z.object({
  date: z.string().describe('Date in YYYY-MM-DD format.'),
  completed: z
    .boolean()
    .describe('Whether a workout was completed on this day.'),
})
