import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { startWorkoutSessionController } from '../controllers/start-workout-session.controller'
import { baseSessionSchema } from '../schemas/session.schema'
import { startWorkoutSessionParamsSchema } from '../schemas/start-workout-session.schema'

export function startWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/start',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Start workout session',
        description:
          'Marks a workout session as in progress and records the start time.',
        params: startWorkoutSessionParamsSchema,
        response: {
          200: z
            .object({
              session: baseSessionSchema.nullable(),
            })
            .describe('Workout session started successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout session not found.'),
          409: z
            .object({ message: z.string() })
            .describe('Workout session is already in progress or completed.'),
        },
      },
    },
    startWorkoutSessionController
  )
}
