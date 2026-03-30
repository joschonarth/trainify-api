import { z } from 'zod'

export const exerciseLogSchema = z.object({
  id: z.string().describe('Log ID.'),
  sets: z.number().describe('Number of sets performed.'),
  reps: z.number().describe('Number of reps performed.'),
  weight: z.number().nullable().describe('Weight used in kilograms.'),
  volume: z
    .number()
    .nullable()
    .describe('Total volume (sets * reps * weight).'),
  description: z.string().nullable().describe('Log notes or description.'),
  date: z.date().describe('Date the log was recorded.'),
  exerciseSessionId: z.string().describe('Exercise session ID.'),
  userId: z.string().describe('User ID.'),
  exerciseId: z.string().describe('Exercise ID.'),
})
