import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteWeightGoalController } from '../controllers/delete-weight-goal.controller'
import { deleteWeightGoalParamsSchema } from '../schemas/delete-weight-goal.schema'

export function deleteWeightGoalRoute(app: FastifyInstance) {
  app.delete(
    '/weight/goals/:goalId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Delete weight goal',
        description:
          'Deletes a specific weight goal for the authenticated user.',
        params: deleteWeightGoalParamsSchema,
        response: {
          204: z.null().describe('Weight goal deleted successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight goal not found.'),
        },
      },
    },
    deleteWeightGoalController
  )
}
