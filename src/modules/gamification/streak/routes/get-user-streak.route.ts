import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserStreakController } from '../controllers/get-user-streak.controller'
import { streakSchema } from '../schemas/streak.schema'

export function getUserStreakRoute(app: FastifyInstance) {
  app.get(
    '/streak',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Gamification'],
        summary: 'Get user streak',
        description:
          'Returns the current and best workout streak for the authenticated user.',
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              streak: streakSchema,
            })
            .describe('User streak fetched successfully.'),
        },
      },
    },
    getUserStreakController
  )
}
