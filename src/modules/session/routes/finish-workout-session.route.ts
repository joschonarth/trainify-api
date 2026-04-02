import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { finishWorkoutSessionController } from '../controllers/finish-workout-session.controller'
import { finishWorkoutSessionParamsSchema } from '../schemas/finish-workout-session.schema'
import { baseSessionSchema } from '../schemas/session.schema'

export function finishWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/finish',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Finish workout session',
        description:
          'Marks a workout session as finished and records the end time and duration.',
        params: finishWorkoutSessionParamsSchema,
        response: {
          200: z
            .object({
              session: baseSessionSchema.nullable(),
            })
            .describe('Workout session finished successfully.'),
          400: z
            .object({ message: z.string() })
            .describe('Workout session has not been started yet.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout session not found.'),
          409: z
            .object({ message: z.string() })
            .describe('Workout session is already completed.'),
        },
      },
    },
    finishWorkoutSessionController
  )
}
