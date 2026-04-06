import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createWeightLogController } from '../controllers/create-weight-log.controller'
import { createWeightLogBodySchema } from '../schemas/create-weight-log.schema'
import { weightLogSchema } from '../schemas/weight-log.schema'

export function createWeightLogRoute(app: FastifyInstance) {
  app.post(
    '/weight/logs',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Create weight log',
        description: 'Creates a new weight log for the authenticated user.',
        body: createWeightLogBodySchema,
        response: {
          201: z
            .object({
              weightLog: weightLogSchema,
            })
            .describe('Weight log created successfully.'),
          400: z
            .object({ message: z.string() })
            .describe('Invalid weight goal.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight goal not found.'),
        },
      },
    },
    createWeightLogController
  )
}
