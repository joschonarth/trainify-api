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
          'Marks a workout session as completed and logs the performance data for each exercise.',
        params: completeWorkoutSessionParamsSchema,
        body: completeWorkoutSessionBodySchema,
        response: {
          200: z
            .object({
              session: sessionWithWorkoutSchema.nullable(),
            })
            .describe('Workout session completed successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout session not found.'),
        },
      },
    },
    completeWorkoutSessionController
  )
}
