import { z } from 'zod'

export const streakSchema = z.object({
  currentStreak: z
    .number()
    .describe('Current consecutive workout streak in days.'),
  bestStreak: z
    .number()
    .describe('Best consecutive workout streak ever achieved.'),
  lastWorkout: z
    .date()
    .nullable()
    .describe('Date of the last workout session.'),
})
