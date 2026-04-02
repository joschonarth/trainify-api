import { z } from 'zod'

export const weightLogSchema = z.object({
  id: z.string().describe('Weight log ID.'),
  userId: z.string().describe('User ID.'),
  goalId: z.string().nullable().describe('Associated weight goal ID.'),
  weight: z.number().describe('Logged weight in kilograms.'),
  note: z.string().nullable().describe('Optional note for the log.'),
  date: z.date().describe('Date of the weight log.'),
  createdAt: z.date().describe('Date the log was created.'),
})
