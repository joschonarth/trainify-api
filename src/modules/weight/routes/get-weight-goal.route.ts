import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightGoalController } from '../controllers/get-weight-goal.controller'
import { getWeightGoalParamsSchema } from '../schemas/get-weight-goal.schema'
import { weightGoalSchema } from '../schemas/weight-goal.schema'

export function getWeightGoalRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals/:goalId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Get weight goal',
        description: 'Returns a specific weight goal by ID.',
        params: getWeightGoalParamsSchema,
        response: {
          200: z
            .object({
              weightGoal: weightGoalSchema,
            })
            .describe('Weight goal fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight goal not found.'),
        },
      },
    },
    getWeightGoalController
  )
}
