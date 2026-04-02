import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getActiveWeightGoalController } from '../controllers/get-active-weight-goal.controller'
import { weightGoalSchema } from '../schemas/weight-goal.schema'

export function getActiveWeightGoalRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals/active',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Get active weight goal',
        description:
          'Returns the currently active weight goal for the authenticated user.',
        response: {
          200: z
            .object({
              activeGoal: weightGoalSchema.nullable(),
            })
            .describe('Active weight goal fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('No active weight goal found.'),
        },
      },
    },
    getActiveWeightGoalController
  )
}
