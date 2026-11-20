import { z } from 'zod'

export const streakSchema = z.object({
  enabled: z.boolean(),
  unit: z.literal('scheduled_training_days'),
  timezone: z.string().nullable(),
  activationDate: z.string().nullable(),
  currentStreak: z
    .number()
    .describe('Current consecutive scheduled training days completed.'),
  bestStreak: z
    .number()
    .describe('Best sequence of scheduled training days completed.'),
  lastWorkout: z
    .date()
    .nullable()
    .describe('Date of the last workout session.'),
})
