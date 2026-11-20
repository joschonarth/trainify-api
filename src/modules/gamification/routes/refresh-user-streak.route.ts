import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { refreshUserStreakController } from '../controllers/refresh-user-streak.controller'
import { streakSchema } from '../schemas/streak.schema'

export function refreshUserStreakRoute(app: FastifyInstance) {
  app.post(
    '/streak/refresh',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Gamification'],
        summary: 'Refresh user streak',
        description:
          'Recalculates and persists the streak from existing activity logs without creating activity. Client migration: replace GET /streak/refresh with POST /streak/refresh. Cookie authentication requires an allowed Origin. Use GET /streak for read-only access.',
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
