import { z } from 'zod'

export const assignDaysToWorkoutParamsSchema = z.object({
  workoutId: z.string(),
})

export const assignDaysToWorkoutBodySchema = z.object({
  daysOfWeek: z
    .array(z.number().int().min(0).max(6))
    .refine((days) => new Set(days).size === days.length, {
      message: 'Days of week must not contain duplicates.',
    }),
})

export type AssignDaysToWorkoutParams = z.infer<
  typeof assignDaysToWorkoutParamsSchema
>
export type AssignDaysToWorkoutBody = z.infer<
  typeof assignDaysToWorkoutBodySchema
>
