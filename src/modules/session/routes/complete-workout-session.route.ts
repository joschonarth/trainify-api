import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { completeWorkoutSessionController } from '../controllers/complete-workout-session.controller'
import {
  completeWorkoutSessionBodySchema,
  completeWorkoutSessionParamsSchema,
} from '../schemas/complete-workout-session.schema'
import { sessionWithWorkoutSchema } from '../schemas/session.schema'

export function completeWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/complete',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Complete workout session',
        description:
          'Records completed exercise performance and skip reasons before closing the session.',
        params: completeWorkoutSessionParamsSchema,
        body: completeWorkoutSessionBodySchema,
        response: {
          400: z
            .object({ message: z.string() })
            .describe('Invalid completion data.'),
          200: z
            .object({
              session: sessionWithWorkoutSchema.nullable(),
            })
            .describe('Workout session completed successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout session not found.'),
          409: z
            .object({ message: z.string() })
            .describe('Workout session was already completed.'),
        },
      },
    },
    completeWorkoutSessionController
  )
}
