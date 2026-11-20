import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteWorkoutController } from '../controllers/delete-workout.controller'
import { deleteWorkoutParamsSchema } from '../schemas/delete-workout.schema'

export function deleteWorkoutRoute(app: FastifyInstance) {
  app.delete(
    '/workouts/:workoutId',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Workouts'],
        summary: 'Delete workout',
        description:
          'Archives a workout owned by the authenticated user while preserving its session history.',
        params: deleteWorkoutParamsSchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          204: z.null().describe('Workout deleted successfully.'),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    deleteWorkoutController
  )
}
