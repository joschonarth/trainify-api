import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { completeWorkoutSessionController } from '../controllers/complete-workout-session.controller'
import {
  completeWorkoutSessionBodySchema,
  completeWorkoutSessionParamsSchema,
  completeWorkoutSessionResponseSchema,
} from '../schemas/complete-workout-session.schema'

export function completeWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/complete',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Complete workout session',
        description:
          'Records exercise performance and closes the session on its captured business day. The response includes the persisted gamification processing ID and status. Poll GET /gamification/processings/{processingId} for the result. A retry returns the original processing and ignores replacement exercise data.',
        params: completeWorkoutSessionParamsSchema,
        body: completeWorkoutSessionBodySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          400: z
            .object({ message: z.string() })
            .describe('Invalid completion data.'),
          200: completeWorkoutSessionResponseSchema.describe(
            'Workout session completed successfully.'
          ),
          404: z
            .object({ message: z.string() })
            .describe('Workout session not found.'),
          409: z
            .object({ message: z.string() })
            .describe('Session is already closed or outside its business day.'),
        },
      },
    },
    completeWorkoutSessionController
  )
}
