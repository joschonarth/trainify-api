import { z } from 'zod'

export const createExerciseLogSessionParamsSchema = z.object({
  sessionId: z.string(),
})

export const createExerciseLogSessionBodySchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().min(1),
  reps: z
    .number()
    .int()
    .min(1)
    .describe(
      'Repetitions per set for REPS; positive integer seconds per set for DURATION. Reported execution comes from the payload, not the timer.'
    ),
  weight: z.number().min(0).nullable(),
  description: z.string().nullable(),
  date: z.iso.datetime().optional(),
})

export type CreateExerciseLogSessionParams = z.infer<
  typeof createExerciseLogSessionParamsSchema
>
export type CreateExerciseLogSessionBody = z.infer<
  typeof createExerciseLogSessionBodySchema
>
