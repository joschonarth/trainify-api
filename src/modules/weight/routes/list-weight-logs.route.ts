import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { listWeightLogsController } from '../controllers/list-weight-logs.controller'
import { weightLogSchema } from '../schemas/weight-log.schema'

export function listWeightLogsRoute(app: FastifyInstance) {
  app.get(
    '/weight/logs',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'List weight logs',
        description: 'Returns all weight logs for the authenticated user.',
        response: {
          200: z
            .object({
              weightLogs: z.array(weightLogSchema),
            })
            .describe('Weight logs fetched successfully.'),
        },
      },
    },
    listWeightLogsController
  )
}
