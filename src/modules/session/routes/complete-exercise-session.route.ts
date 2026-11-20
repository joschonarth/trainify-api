import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { completeExerciseSessionController } from '../controllers/complete-exercise-session.controller'
import { completeExerciseSessionParamsSchema } from '../schemas/complete-exercise-session.schema'
import { exerciseTimerSessionSchema } from '../schemas/exercise-session.schema'

export function completeExerciseSessionRoute(app: FastifyInstance) {
  app.patch(
    '/sessions/exercises/:exerciseSessionId/complete',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Complete exercise session',
        deprecated: true,
        description:
          'Deprecated. Complete exercises through POST /sessions/:sessionId/complete.',
        params: completeExerciseSessionParamsSchema,
        response: {
          200: z
            .object({
              exerciseSession: exerciseTimerSessionSchema,
            })
            .describe('Exercise session completed successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise session not found.'),
        },
      },
    },
    completeExerciseSessionController
  )
}
