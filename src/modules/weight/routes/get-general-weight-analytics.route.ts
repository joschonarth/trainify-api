import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getGeneralWeightAnalyticsController } from '../controllers/get-general-weight-analytics.controller'
import { getGeneralWeightAnalyticsQuerySchema } from '../schemas/get-general-weight-analytics.schema'
import { weightAnalyticsSchema } from '../schemas/weight-analytics.schema'

export function getGeneralWeightAnalyticsRoute(app: FastifyInstance) {
  app.get(
    '/weight/analytics/general',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Get general weight analytics',
        description:
          'Returns general weight analytics for the authenticated user, including data points, weekly change rate and trend direction. Optionally filter by date range.',
        querystring: getGeneralWeightAnalyticsQuerySchema,
        response: {
          200: z
            .object({
              analytics: weightAnalyticsSchema,
            })
            .describe('General weight analytics fetched successfully.'),
        },
      },
    },
    getGeneralWeightAnalyticsController
  )
}
