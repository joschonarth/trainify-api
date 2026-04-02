import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightLogController } from '../controllers/get-weight-log.controller'
import { getWeightLogParamsSchema } from '../schemas/get-weight-log.schema'
import { weightLogSchema } from '../schemas/weight-log.schema'

export function getWeightLogRoute(app: FastifyInstance) {
  app.get(
    '/weight/logs/:logId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Get weight log',
        description: 'Returns a specific weight log by ID.',
        params: getWeightLogParamsSchema,
        response: {
          200: weightLogSchema.describe('Weight log fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight log not found.'),
        },
      },
    },
    getWeightLogController
  )
}
