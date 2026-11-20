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
          'Deprecated. Complete exercises through POST /sessions/:sessionId/complete. New execution is allowed only on the session business day in its captured timezone; expired or future sessions return 409. Earlier sessions without a daily identity use their date in America/Sao_Paulo.',
        params: completeExerciseSessionParamsSchema,
        response: {
          409: z
            .object({ message: z.string() })
            .describe('Session is outside its business day.'),
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
