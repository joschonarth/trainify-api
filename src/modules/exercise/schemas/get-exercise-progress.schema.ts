import { z } from 'zod'

export const getExerciseProgressParamsSchema = z.object({
  exerciseId: z.cuid(),
})

export const getExerciseProgressQuerySchema = z.object({
  period: z
    .enum(['WEEK', 'MONTH', 'ALL'])
    .optional()
    .default('ALL')
    .describe(
      'Rolling windows: WEEK = last 168 hours, MONTH = last 720 hours; ALL = full history. Dates are based on exercise logs.'
    ),
})

export type GetExerciseProgressParams = z.infer<
  typeof getExerciseProgressParamsSchema
>
export type GetExerciseProgressQuery = z.infer<
  typeof getExerciseProgressQuerySchema
>
