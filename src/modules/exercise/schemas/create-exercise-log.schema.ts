import { z } from 'zod'

export const createExerciseLogBodySchema = z.object({
  exerciseId: z.string(),
  sets: z.number(),
  reps: z.number(),
  weight: z.number().nullable(),
  description: z.string().nullable(),
  date: z.iso.datetime().optional(),
})

export type CreateExerciseLogBody = z.infer<typeof createExerciseLogBodySchema>
