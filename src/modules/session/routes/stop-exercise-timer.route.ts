import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { stopExerciseTimerController } from '../controllers/stop-exercise-timer.controller'
import { exerciseTimerSessionSchema } from '../schemas/exercise-session.schema'
import { stopExerciseTimerParamsSchema } from '../schemas/stop-exercise-timer.schema'

export function stopExerciseTimerRoute(app: FastifyInstance) {
  app.post(
    '/sessions/exercises/:exerciseSessionId/stop',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Stop exercise timer',
        description:
          'Stops a timer on an unfinished exercise in an active workout session. Repeated stops preserve the original timestamps and duration without writing. New execution is allowed only on the session business day in its captured timezone; expired or future sessions return 409. Earlier sessions without a daily identity use their date in America/Sao_Paulo.',
        params: stopExerciseTimerParamsSchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          409: z
            .object({ message: z.string() })
            .describe('Session is outside its business day.'),
          200: z
            .object({
              exerciseSession: exerciseTimerSessionSchema,
              elapsed: z.number().describe('Elapsed time in seconds.'),
            })
            .describe('Exercise timer stopped successfully.'),
          400: z
            .object({ message: z.string() })
            .describe('Exercise timer has not been started.'),
          403: z
            .object({ message: z.string() })
            .describe('Session is not active or the exercise is completed.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise session not found.'),
        },
      },
    },
    stopExerciseTimerController
  )
}
