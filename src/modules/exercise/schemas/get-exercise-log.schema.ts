import { z } from 'zod'

export const getExerciseLogParamsSchema = z.object({
  id: z.string(),
})

export type GetExerciseLogParams = z.infer<typeof getExerciseLogParamsSchema>
