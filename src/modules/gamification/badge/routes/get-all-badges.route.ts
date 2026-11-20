import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getAllBadgesController } from '../controllers/get-all-badges.controller'
import { badgeSchema } from '../schemas/badge.schema'
import { getAllBadgesQuerySchema } from '../schemas/get-all-badges.schema'

export function getAllBadgesRoute(app: FastifyInstance) {
  app.get(
    '/badges',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Gamification'],
        summary: 'Get all badges',
        description:
          'Returns all badges available in the system with their unlock status for the authenticated user. Optionally filter by type or unlock status.',
        querystring: getAllBadgesQuerySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              badges: z.array(badgeSchema),
            })
            .describe('Badges fetched successfully.'),
        },
      },
    },
    getAllBadgesController
  )
}
