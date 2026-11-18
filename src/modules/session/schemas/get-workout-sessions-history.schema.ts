import { WorkoutSessionStatus } from 'generated/prisma'
import { z } from 'zod'

export const getWorkoutSessionsHistoryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    status: z.enum(WorkoutSessionStatus).optional(),
    workoutId: z.string().min(1).optional(),
  })
  .refine(({ from, to }) => !(from && to) || from <= to, {
    message: '`from` must be earlier than or equal to `to`.',
    path: ['to'],
  })

export type GetWorkoutSessionsHistoryQuery = z.infer<
  typeof getWorkoutSessionsHistoryQuerySchema
>
