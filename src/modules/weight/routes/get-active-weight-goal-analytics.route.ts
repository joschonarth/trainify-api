import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getActiveWeightGoalAnalyticsController } from '../controllers/get-active-weight-goal-analytics.controller'
import { weightAnalyticsSchema } from '../schemas/weight-analytics.schema'

export function getActiveWeightGoalAnalyticsRoute(app: FastifyInstance) {
  app.get(
    '/weight/analytics/goal',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Get active weight goal analytics',
        description:
          'Returns weight analytics for the currently active weight goal of the authenticated user, including data points, weekly change rate and trend direction.',
        response: {
          200: z
            .object({
              analytics: weightAnalyticsSchema,
            })
            .describe('Active weight goal analytics fetched successfully.'),
        },
      },
    },
    getActiveWeightGoalAnalyticsController
  )
}
