import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightGoalLogsController } from '../controllers/get-weight-goal-logs.controller'
import { getWeightGoalLogsParamsSchema } from '../schemas/get-weight-goal-logs.schema'
import { weightLogSchema } from '../schemas/weight-log.schema'

export function getWeightGoalLogsRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals/:goalId/logs',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Weight'],
        summary: 'Get weight goal logs',
        description:
          'Returns all weight logs associated with a specific weight goal.',
        params: getWeightGoalLogsParamsSchema,
        response: {
          200: z
            .object({
              logs: z.array(
                weightLogSchema.pick({
                  id: true,
                  weight: true,
                  note: true,
                  date: true,
                  createdAt: true,
                })
              ),
            })
            .describe('Weight goal logs fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Weight goal not found.'),
        },
      },
    },
    getWeightGoalLogsController
  )
}
