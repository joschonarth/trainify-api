import { z } from 'zod'

export const deleteWorkoutParamsSchema = z.object({
  workoutId: z.string(),
})

export type DeleteWorkoutParams = z.infer<typeof deleteWorkoutParamsSchema>
