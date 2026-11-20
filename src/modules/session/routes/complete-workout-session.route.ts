import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { completeWorkoutSessionController } from '../controllers/complete-workout-session.controller'
import {
  completeWorkoutSessionBodySchema,
  completeWorkoutSessionParamsSchema,
  completeWorkoutSessionResponseSchema,
} from '../schemas/complete-workout-session.schema'

export function completeWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/complete',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Complete workout session',
        description:
          'Records exercise performance and closes the session atomically using its captured exercises. Returns unlockedBadges, always an array of new awards. Retries of completions recorded by this endpoint return the stored session, ignore replacement exercise data and retry rewards without rewriting execution. Streak and badges run after the completion transaction: a reward failure may return an error even though the session is already closed; retry this endpoint to recover. New activity credit uses the persisted session business date and timezone, independently of timer end time. Retries can recover rewards after that day without new execution writes; old completion records retain their original completion-time credit. Newly awarded badges are not replayed after a lost response; exactly-once UI delivery is not guaranteed. Legacy closed sessions without a completion record still return 409. New execution is allowed only on the session business day in its captured timezone; expired or future sessions return 409. Earlier sessions without a daily identity use their date in America/Sao_Paulo.',
        params: completeWorkoutSessionParamsSchema,
        body: completeWorkoutSessionBodySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          400: z
            .object({ message: z.string() })
            .describe('Invalid completion data.'),
          200: completeWorkoutSessionResponseSchema.describe(
            'Workout session completed successfully.'
          ),
          404: z
            .object({ message: z.string() })
            .describe('Workout session not found.'),
          409: z
            .object({ message: z.string() })
            .describe(
              'Session is already completed or outside its business day.'
            ),
        },
      },
    },
    completeWorkoutSessionController
  )
}
