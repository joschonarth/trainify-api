import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createWeightGoalController } from '../controllers/create-weight-goal.controller'
import { createWeightGoalBodySchema } from '../schemas/create-weight-goal.schema'
import { weightGoalSchema } from '../schemas/weight-goal.schema'

export function createWeightGoalRoute(app: FastifyInstance) {
  app.post(
    '/weight/goals',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Weight'],
        summary: 'Create weight goal',
        description: 'Creates a new weight goal for the authenticated user.',
        body: createWeightGoalBodySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          201: z
            .object({
              weightGoal: weightGoalSchema,
            })
            .describe('Weight goal created successfully.'),
        },
      },
    },
    createWeightGoalController
  )
}
