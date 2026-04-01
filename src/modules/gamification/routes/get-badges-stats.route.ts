import type { FastifyInstance } from 'fastify'
import { BadgeType } from 'generated/prisma'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getBadgesStatsController } from '../controllers/get-badges-stats.controller'

const badgeTypeStatsSchema = z.object({
  total: z.number().describe('Total number of badges of this type.'),
  unlocked: z.number().describe('Number of unlocked badges of this type.'),
  progress: z.number().describe('Unlock progress percentage for this type.'),
})

export function getBadgesStatsRoute(app: FastifyInstance) {
  app.get(
    '/badges/stats',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Gamification'],
        summary: 'Get badges stats',
        description:
          'Returns badge unlock statistics for the authenticated user, both overall and broken down by badge type.',
        response: {
          200: z
            .object({
              stats: z.object({
                overall: z.object({
                  total: z
                    .number()
                    .describe('Total number of badges available.'),
                  unlocked: z
                    .number()
                    .describe('Total number of badges unlocked.'),
                  progress: z
                    .number()
                    .describe('Overall unlock progress percentage.'),
                }),
                byType: z
                  .record(z.enum(BadgeType), badgeTypeStatsSchema)
                  .describe('Stats broken down by badge type.'),
              }),
            })
            .describe('Badge stats fetched successfully.'),
        },
      },
    },
    getBadgesStatsController
  )
}
