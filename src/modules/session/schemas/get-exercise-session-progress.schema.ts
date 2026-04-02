import { z } from 'zod'

export const getExerciseSessionProgressParamsSchema = z.object({
  exerciseId: z.cuid(),
})

export const getExerciseSessionProgressQuerySchema = z.object({
  period: z.enum(['WEEK', 'MONTH', 'ALL']).optional().default('ALL'),
})

export type GetExerciseSessionProgressParams = z.infer<
  typeof getExerciseSessionProgressParamsSchema
>
export type GetExerciseSessionProgressQuery = z.infer<
  typeof getExerciseSessionProgressQuerySchema
>
