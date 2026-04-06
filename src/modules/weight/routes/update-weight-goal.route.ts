import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWeightGoalController } from '../controllers/update-weight-goal.controller'
import {
  updateWeightGoalBodySchema,
  updateWeightGoalParamsSchema,
} from '../schemas/update-weight-goal.schema'
import { weightGoalSchema } from '../schemas/weight-goal.schema'

export function updateWeightGoalRoute(app: FastifyInstance) {
  app.put(
    '/weight/goals/:goalId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Update weight goal',
        description:
          'Updates a specific weight goal for the authenticated user. All fields are optional.',
        params: updateWeightGoalParamsSchema,
        body: updateWeightGoalBodySchema,
        response: {
          200: z
            .object({
              weightGoal: weightGoalSchema,
            })
            .describe('Weight goal updated successfully.'),
          400: z
            .object({ message: z.string() })
            .describe('Invalid weight goal data.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight goal not found.'),
        },
      },
    },
    updateWeightGoalController
  )
}
