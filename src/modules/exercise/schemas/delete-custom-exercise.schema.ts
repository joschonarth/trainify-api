import { z } from 'zod'

export const deleteCustomExerciseParamsSchema = z.object({
  exerciseId: z.string(),
})

export type DeleteCustomExerciseParams = z.infer<
  typeof deleteCustomExerciseParamsSchema
>
