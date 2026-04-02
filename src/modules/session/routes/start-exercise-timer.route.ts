import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { startExerciseTimerController } from '../controllers/start-exercise-timer.controller'
import { exerciseTimerSessionSchema } from '../schemas/session.schema'
import { startExerciseTimerParamsSchema } from '../schemas/start-exercise-timer.schema'

export function startExerciseTimerRoute(app: FastifyInstance) {
  app.post(
    '/sessions/exercises/:exerciseSessionId/start',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Start exercise timer',
        description: 'Starts the timer for a specific exercise session.',
        params: startExerciseTimerParamsSchema,
        response: {
          200: z
            .object({
              exerciseSession: exerciseTimerSessionSchema,
            })
            .describe('Exercise timer started successfully.'),
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
