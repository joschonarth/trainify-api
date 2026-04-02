import { z } from 'zod'

export const createExerciseLogSessionParamsSchema = z.object({
  sessionId: z.string(),
})

export const createExerciseLogSessionBodySchema = z.object({
  exerciseId: z.string(),
  sets: z.number(),
  reps: z.number(),
  weight: z.number().nullable(),
  description: z.string().nullable(),
})

export type CreateExerciseLogSessionParams = z.infer<
  typeof createExerciseLogSessionParamsSchema
>
export type CreateExerciseLogSessionBody = z.infer<
  typeof createExerciseLogSessionBodySchema
>
