import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { listWeightLogsController } from '../controllers/list-weight-logs.controller'
import { listWeightLogsQuerySchema } from '../schemas/list-weight-logs.schema'
import { weightLogSchema } from '../schemas/weight-log.schema'

export function listWeightLogsRoute(app: FastifyInstance) {
  app.get(
    '/weight/logs',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Weight'],
        summary: 'List weight logs',
        description:
          'Returns a page of weight logs for the authenticated user, ordered by measurement date and ID.',
        querystring: listWeightLogsQuerySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              weightLogs: z.array(weightLogSchema),
              pagination: z.object({
                page: z.number().describe('Current page, starting at 1.'),
                pageSize: z.number().describe('Number of logs per page.'),
                total: z.number().describe('Total number of matching logs.'),
                totalPages: z
                  .number()
                  .describe('Total number of result pages.'),
              }),
            })
            .describe('Weight logs fetched successfully.'),
        },
      },
    },
    listWeightLogsController
  )
}
