import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { stopExerciseTimerController } from '../controllers/stop-exercise-timer.controller'
import { exerciseTimerSessionSchema } from '../schemas/session.schema'
import { stopExerciseTimerParamsSchema } from '../schemas/stop-exercise-timer.schema'

export function stopExerciseTimerRoute(app: FastifyInstance) {
  app.post(
    '/sessions/exercises/:exerciseSessionId/stop',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Stop exercise timer',
        description:
          'Stops the timer for a specific exercise session and records the elapsed time.',
        params: stopExerciseTimerParamsSchema,
        response: {
          200: z
            .object({
              exerciseSession: exerciseTimerSessionSchema,
              elapsed: z.number().describe('Elapsed time in seconds.'),
            })
            .describe('Exercise timer stopped successfully.'),
          400: z
            .object({ message: z.string() })
            .describe('Exercise timer has not been started.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise session not found.'),
        },
      },
    },
    stopExerciseTimerController
  )
}
