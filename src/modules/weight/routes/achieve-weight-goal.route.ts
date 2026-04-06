import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { achieveWeightGoalController } from '../controllers/achieve-weight-goal.controller'
import { achieveWeightGoalParamsSchema } from '../schemas/achieve-weight-goal.schema'
import { weightGoalSchema } from '../schemas/weight-goal.schema'

export function achieveWeightGoalRoute(app: FastifyInstance) {
  app.patch(
    '/weight/goals/:goalId/achieve',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Achieve weight goal',
        description:
          'Marks a weight goal as achieved for the authenticated user.',
        params: achieveWeightGoalParamsSchema,
        response: {
          200: z
            .object({
              weightGoal: weightGoalSchema,
              progress: z
                .number()
                .describe(
                  'Goal progress percentage at the time of achievement.'
                ),
            })
            .describe('Weight goal achieved successfully.'),
          400: z
            .object({ message: z.string() })
            .describe('Weight goal has not been achieved yet.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight goal not found.'),
        },
      },
    },
    achieveWeightGoalController
  )
}
