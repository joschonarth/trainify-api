import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWeightLogController } from '../controllers/update-weight-log.controller'
import {
  updateWeightLogBodySchema,
  updateWeightLogParamsSchema,
} from '../schemas/update-weight-log.schema'
import { weightLogSchema } from '../schemas/weight-log.schema'

export function updateWeightLogRoute(app: FastifyInstance) {
  app.put(
    '/weight/logs/:logId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Update weight log',
        description:
          'Updates a specific weight log for the authenticated user.',
        params: updateWeightLogParamsSchema,
        body: updateWeightLogBodySchema,
        response: {
          200: z
            .object({
              updatedLog: weightLogSchema,
            })
            .describe('Weight log updated successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight log not found.'),
        },
      },
    },
    updateWeightLogController
  )
}
