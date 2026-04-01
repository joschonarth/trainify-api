import { z } from 'zod'

export const removeWorkoutScheduleDayParamsSchema = z.object({
  workoutId: z.string(),
  scheduleId: z.string(),
})

export type RemoveWorkoutScheduleDayParams = z.infer<
  typeof removeWorkoutScheduleDayParamsSchema
>
