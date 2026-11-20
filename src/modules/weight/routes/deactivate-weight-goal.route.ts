import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deactivateWeightGoalController } from '../controllers/deactivate-weight-goal.controller'
import { deactivateWeightGoalParamsSchema } from '../schemas/deactivate-weight-goal.schema'

export function deactivateWeightGoalRoute(app: FastifyInstance) {
  app.patch(
    '/weight/goals/:goalId/deactivate',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Weight'],
        summary: 'Deactivate weight goal',
        description:
          'Deactivates an owned weight goal under the same per-user transaction lock as weight logs and other goal mutations. Repeating deactivation of an inactive goal returns 204 without another write. Missing and foreign goals return the same 404.',
        params: deactivateWeightGoalParamsSchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          204: z.null().describe('Weight goal deactivated successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight goal not found.'),
        },
      },
    },
    deactivateWeightGoalController
  )
}
