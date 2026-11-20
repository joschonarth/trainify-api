import { GoalType } from 'generated/prisma'
import { z } from 'zod'

export const createWeightGoalBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().default(null),
  goalType: z.enum(GoalType),
  targetWeight: z.number().positive(),
  startDate: z.iso
    .datetime()
    .transform((value) => new Date(value))
    .optional()
    .default(() => new Date()),
  endDate: z.iso
    .datetime()
    .transform((value) => new Date(value))
    .nullable()
    .default(null),
})

export type CreateWeightGoalBody = z.infer<typeof createWeightGoalBodySchema>
