import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getDailyWorkoutSessionController } from '../controllers/get-daily-workout-session.controller'
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
          "Returns the authenticated user's daily workout session using their IANA timezone. This GET creates a session and its exercise snapshot when none exists. Concurrent requests return the same session. Daily identities retain their original business date and timezone when the user changes timezone.",
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
