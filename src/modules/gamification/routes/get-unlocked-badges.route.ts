import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUnlockedBadgesController } from '../controllers/get-unlocked-badges.controller'
import { badgeSchema } from '../schemas/badge.schema'

export function getUnlockedBadgesRoute(app: FastifyInstance) {
  app.get(
    '/badges/unlocked',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Gamification'],
        summary: 'Get unlocked badges',
        description: 'Returns all badges unlocked by the authenticated user.',
        response: {
          200: z
            .object({
              badges: z.array(
                badgeSchema.omit({ unlocked: true }).extend({
                  unlockedAt: z.date().describe('Date the badge was unlocked.'),
                })
              ),
            })
            .describe('Unlocked badges fetched successfully.'),
        },
      },
    },
    getUnlockedBadgesController
  )
}
