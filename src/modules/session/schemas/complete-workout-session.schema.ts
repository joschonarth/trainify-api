import { z } from 'zod'

export const completeWorkoutSessionParamsSchema = z.object({
  sessionId: z.cuid(),
})

export const completeWorkoutSessionBodySchema = z.object({
  exercises: z
    .array(
      z.object({
        exerciseSessionId: z.cuid(),
        sets: z.number().min(1, 'Sets must be at least 1'),
        reps: z.number().min(1, 'Reps must be at least 1'),
        weight: z.number().optional().default(0),
        completed: z.boolean(),
        note: z.string().optional(),
      })
    )
    .min(1, 'At least one exercise is required'),
})

export type CompleteWorkoutSessionParams = z.infer<
  typeof completeWorkoutSessionParamsSchema
>
export type CompleteWorkoutSessionBody = z.infer<
  typeof completeWorkoutSessionBodySchema
>
