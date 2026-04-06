import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteWeightLogController } from '../controllers/delete-weight-log.controller'
import { deleteWeightLogParamsSchema } from '../schemas/delete-weight-log.schema'

export function deleteWeightLogRoute(app: FastifyInstance) {
  app.delete(
    '/weight/logs/:logId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Delete weight log',
        description:
          'Deletes a specific weight log for the authenticated user.',
        params: deleteWeightLogParamsSchema,
        response: {
          204: z.null().describe('Weight log deleted successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight log not found.'),
        },
      },
    },
    deleteWeightLogController
  )
}
