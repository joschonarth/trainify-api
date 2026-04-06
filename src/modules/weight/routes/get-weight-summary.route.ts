import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightSummaryController } from '../controllers/get-weight-summary.controller'

export function getWeightSummaryRoute(app: FastifyInstance) {
  app.get(
    '/weight/summary',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Get weight summary',
        description:
          'Returns a summary of weight metrics for the authenticated user.',
        response: {
          200: z
            .object({
              summary: z.object({
                currentWeight: z
                  .number()
                  .nullable()
                  .describe('Most recent logged weight in kilograms.'),
                startWeight: z
                  .number()
                  .nullable()
                  .describe('First logged weight in kilograms.'),
                variation: z
                  .number()
                  .nullable()
                  .describe(
                    'Weight variation from start to current in kilograms.'
                  ),
                averageWeight: z
                  .number()
                  .nullable()
                  .describe('Average weight across all logs in kilograms.'),
                minWeight: z
                  .number()
                  .nullable()
                  .describe('Lowest logged weight in kilograms.'),
                maxWeight: z
                  .number()
                  .nullable()
                  .describe('Highest logged weight in kilograms.'),
                lastLogDate: z
                  .date()
                  .nullable()
                  .describe('Date of the most recent weight log.'),
              }),
            })
            .describe('Weight summary fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('No weight logs found.'),
        },
      },
    },
    getWeightSummaryController
  )
}
