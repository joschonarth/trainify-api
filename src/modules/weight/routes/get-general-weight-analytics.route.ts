import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getGeneralWeightAnalyticsController } from '../controllers/get-general-weight-analytics.controller'
import { getGeneralWeightAnalyticsQuerySchema } from '../schemas/get-general-weight-analytics.schema'

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
              analytics: z.object({
                dataPoints: z
                  .array(
                    z.object({
                      date: z.date().describe('Date of the weight log.'),
                      weight: z
                        .number()
                        .describe('Logged weight in kilograms.'),
                    })
                  )
                  .describe('Weight data points over time.'),
                avgChangePerWeek: z
                  .number()
                  .describe('Average weight change per week in kilograms.'),
                trendDirection: z
                  .enum(['increasing', 'decreasing', 'stable'])
                  .describe('Overall weight trend direction.'),
              }),
            })
            .describe('General weight analytics fetched successfully.'),
        },
      },
    },
    getGeneralWeightAnalyticsController
  )
}
