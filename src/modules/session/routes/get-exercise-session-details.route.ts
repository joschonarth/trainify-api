import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseSessionDetailsController } from '../controllers/get-exercise-session-details.controller'
import { getExerciseSessionDetailsParamsSchema } from '../schemas/get-exercise-session-details.schema'
import { exerciseSessionDetailsSchema } from '../schemas/session.schema'

export function getExerciseSessionDetailsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/exercises/:exerciseSessionId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Get exercise session details',
        description: 'Returns the details of a specific exercise session.',
        params: getExerciseSessionDetailsParamsSchema,
        response: {
          200: z
            .object({
              session: exerciseSessionDetailsSchema,
            })
            .describe('Exercise session details fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise session not found.'),
        },
      },
    },
    getExerciseSessionDetailsController
  )
}
