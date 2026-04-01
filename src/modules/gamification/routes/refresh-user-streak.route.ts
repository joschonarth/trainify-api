import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { refreshUserStreakController } from '../controllers/refresh-user-streak.controller'
import { streakSchema } from '../schemas/streak.schema'

export function refreshUserStreakRoute(app: FastifyInstance) {
  app.get(
    '/streak/refresh',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Gamification'],
        summary: 'Refresh user streak',
        description:
          'Recalculates and updates the authenticated user streak based on the current date.',
        response: {
          200: z
            .object({
              streak: streakSchema,
            })
            .describe('User streak refreshed successfully.'),
        },
      },
    },
    refreshUserStreakController
  )
}
