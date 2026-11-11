import { z } from 'zod'

export const getExerciseProgressParamsSchema = z.object({
  exerciseId: z.cuid(),
})

export const getExerciseProgressQuerySchema = z.object({
  period: z.enum(['WEEK', 'MONTH', 'ALL']).optional().default('ALL'),
})

export type GetExerciseProgressParams = z.infer<
  typeof getExerciseProgressParamsSchema
>
export type GetExerciseProgressQuery = z.infer<
  typeof getExerciseProgressQuerySchema
>
