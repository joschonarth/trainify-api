import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserMetricsController } from '../controllers/get-user-metrics.controller'

export function getUserMetricsRoute(app: FastifyInstance) {
  app.get(
    '/metrics',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Metrics'],
        summary: 'Get user metrics',
        description:
          'Returns overall fitness metrics for the authenticated user, including total workouts, exercises and workout duration.',
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              metrics: z.object({
                totalWorkouts: z
                  .number()
                  .describe('Total number of completed workout sessions.'),
                totalExercises: z
                  .number()
                  .describe('Total number of completed exercise sessions.'),
                totalWorkoutDuration: z
                  .number()
                  .describe(
                    'Total workout duration in seconds across all sessions.'
                  ),
              }),
            })
            .describe('User metrics fetched successfully.'),
        },
      },
    },
    getUserMetricsController
  )
}
