import { z } from 'zod'

export const assignDaysToWorkoutParamsSchema = z.object({
  workoutId: z.string(),
})

export const assignDaysToWorkoutBodySchema = z.object({
  daysOfWeek: z.array(z.number().min(0).max(6)),
})

export type AssignDaysToWorkoutParams = z.infer<
  typeof assignDaysToWorkoutParamsSchema
>
export type AssignDaysToWorkoutBody = z.infer<
  typeof assignDaysToWorkoutBodySchema
>
