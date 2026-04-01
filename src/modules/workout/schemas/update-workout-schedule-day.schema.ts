import { z } from 'zod'

export const updateWorkoutScheduleDayParamsSchema = z.object({
  workoutId: z.string(),
  scheduleId: z.string(),
})

export const updateWorkoutScheduleDayBodySchema = z.object({
  newDayOfWeek: z.number().min(0).max(6),
})

export type UpdateWorkoutScheduleDayParams = z.infer<
  typeof updateWorkoutScheduleDayParamsSchema
>
export type UpdateWorkoutScheduleDayBody = z.infer<
  typeof updateWorkoutScheduleDayBodySchema
>
