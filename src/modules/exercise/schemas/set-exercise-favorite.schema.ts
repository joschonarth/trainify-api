import { z } from 'zod'
export const setExerciseFavoriteParamsSchema = z.object({
  exerciseId: z.string().min(1),
})
export const setExerciseFavoriteBodySchema = z.strictObject({
  isFavorite: z.boolean(),
})
export const setExerciseFavoriteResponseSchema = z.object({
  exerciseId: z.string(),
  isFavorite: z.boolean(),
})
