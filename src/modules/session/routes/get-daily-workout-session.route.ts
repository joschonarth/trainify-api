import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getDailyWorkoutSessionController } from '../controllers/get-daily-workout-sessions.controller'
import { sessionWithWorkoutSchema } from '../schemas/session.schema'

export function getDailyWorkoutSessionRoute(app: FastifyInstance) {
  app.get(
    '/sessions/today',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Get daily workout session',
        description:
          "Returns the authenticated user's workout session for today.",
        response: {
          200: z
            .object({
              session: sessionWithWorkoutSchema,
            })
            .describe("Today's workout session fetched successfully."),
          404: z
            .object({ message: z.string() })
            .describe('No workout session found for today.'),
        },
      },
    },
    getDailyWorkoutSessionController
  )
}
