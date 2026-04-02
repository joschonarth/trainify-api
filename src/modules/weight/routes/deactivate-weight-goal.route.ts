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
        tags: ['Weight'],
        summary: 'Deactivate weight goal',
        description:
          'Deactivates a specific weight goal for the authenticated user.',
        params: deactivateWeightGoalParamsSchema,
        response: {
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
