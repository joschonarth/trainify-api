import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { startExerciseTimerController } from '../controllers/start-exercise-timer.controller'
import { exerciseTimerSessionSchema } from '../schemas/exercise-session.schema'
import { startExerciseTimerParamsSchema } from '../schemas/start-exercise-timer.schema'

export function startExerciseTimerRoute(app: FastifyInstance) {
  app.post(
    '/sessions/exercises/:exerciseSessionId/start',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Start exercise timer',
        description:
          'Starts a timer on an unfinished exercise in an active workout session. Only one timer can run per session. Restarting a stopped timer clears its previous duration. New execution is allowed only on the session business day in its captured timezone; expired or future sessions return 409. Earlier sessions without a daily identity use their date in America/Sao_Paulo.',
        params: startExerciseTimerParamsSchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              exerciseSession: exerciseTimerSessionSchema,
            })
            .describe('Exercise timer started successfully.'),
          403: z
            .object({ message: z.string() })
            .describe('Session is not active or the exercise is completed.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise session not found.'),
          409: z
            .object({ message: z.string() })
            .describe(
              'Exercise timer is already running or another exercise timer is running.'
            ),
        },
      },
    },
    startExerciseTimerController
  )
}
