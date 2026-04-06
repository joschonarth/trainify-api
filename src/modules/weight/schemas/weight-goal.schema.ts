import { GoalType } from 'generated/prisma'
import { z } from 'zod'

export const weightGoalSchema = z.object({
  id: z.string().describe('Weight goal ID.'),
  userId: z.string().describe('User ID.'),
  name: z.string().describe('Goal name.'),
  description: z.string().nullable().describe('Goal description.'),
  goalType: z.enum(GoalType).describe('Goal type.'),
  startWeight: z.number().nullable().describe('Starting weight in kilograms.'),
  targetWeight: z.number().describe('Target weight in kilograms.'),
  startDate: z.date().describe('Goal start date.'),
  endDate: z.date().nullable().describe('Goal end date.'),
  achievedAt: z.date().nullable().describe('Date the goal was achieved.'),
  isActive: z.boolean().describe('Whether the goal is currently active.'),
  progress: z.number().describe('Goal progress percentage.'),
  createdAt: z.date().describe('Date the goal was created.'),
  updatedAt: z.date().describe('Date the goal was last updated.'),
})
