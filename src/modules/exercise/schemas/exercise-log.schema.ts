import { z } from 'zod'

export const exerciseLogSchema = z.object({
  id: z.string().describe('Log ID.'),
  sets: z.number().describe('Number of sets performed.'),
  reps: z
    .number()
    .describe(
      'Repetitions per set for REPS; positive integer seconds per set for DURATION. Reported execution comes from the payload, not the timer.'
    ),
  weight: z.number().nullable().describe('Weight used in kilograms.'),
  volume: z
    .number()
    .nullable()
    .describe(
      'Load volume (sets * reps * weight) for REPS; always zero for DURATION, including legacy logs.'
    ),
  description: z.string().nullable().describe('Log notes or description.'),
  date: z.date().describe('Date the log was recorded.'),
  exerciseSessionId: z.string().describe('Exercise session ID.'),
  userId: z.string().describe('User ID.'),
  exerciseId: z.string().describe('Exercise ID.'),
})
