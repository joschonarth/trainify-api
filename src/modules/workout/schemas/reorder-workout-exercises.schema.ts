import { z } from 'zod'

export const reorderWorkoutExercisesParamsSchema = z.object({
  workoutId: z.string(),
})

export const reorderWorkoutExercisesBodySchema = z.object({
  exerciseIds: z.array(z.string().min(1)),
})

export type ReorderWorkoutExercisesParams = z.infer<
  typeof reorderWorkoutExercisesParamsSchema
>
export type ReorderWorkoutExercisesBody = z.infer<
  typeof reorderWorkoutExercisesBodySchema
>
