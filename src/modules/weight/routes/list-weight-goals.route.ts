import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { listWeightGoalsController } from '../controllers/list-weight-goals.controller'
import { listWeightGoalsQuerySchema } from '../schemas/list-weight-goals.schema'
import { weightGoalSchema } from '../schemas/weight-goal.schema'

export function listWeightGoalsRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Weight'],
        summary: 'List weight goals',
        description:
          'Returns all weight goals for the authenticated user. Optionally filter by status.',
        querystring: listWeightGoalsQuerySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              weightGoals: z.array(weightGoalSchema),
            })
            .describe('Weight goals fetched successfully.'),
        },
      },
    },
    listWeightGoalsController
  )
}
