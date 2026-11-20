import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { setExerciseFavoriteController } from '../controllers/set-exercise-favorite.controller'
import {
  setExerciseFavoriteBodySchema,
  setExerciseFavoriteParamsSchema,
  setExerciseFavoriteResponseSchema,
} from '../schemas/set-exercise-favorite.schema'
export function setExerciseFavoriteRoute(app: FastifyInstance) {
  const error = z.object({ message: z.string() })
  app.patch(
    '/exercises/my/:exerciseId/favorite',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Set exercise favorite',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        params: setExerciseFavoriteParamsSchema,
        body: setExerciseFavoriteBodySchema,
        response: {
          200: setExerciseFavoriteResponseSchema,
          400: error,
          401: error,
          403: error,
          404: error,
        },
      },
    },
    setExerciseFavoriteController
  )
}
