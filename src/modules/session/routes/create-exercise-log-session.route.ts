import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { exerciseLogSchema } from '@/modules/exercise/schemas/exercise-log.schema'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createExerciseLogSessionController } from '../controllers/create-exercise-log-session.controller'
import {
  createExerciseLogSessionBodySchema,
  createExerciseLogSessionParamsSchema,
} from '../schemas/create-exercise-log-session.schema'

export function createExerciseLogSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/logs',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Create exercise log session',
        deprecated: true,
        description:
          'Each request appends a contributing log; repeated values do not replace previous logs. Deprecated. Use POST /sessions/:sessionId/complete to record exercise performance. New execution is allowed only on the session business day in its captured timezone; expired or future sessions return 409. Earlier sessions without a daily identity use their date in America/Sao_Paulo.',
        params: createExerciseLogSessionParamsSchema,
        body: createExerciseLogSessionBodySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          409: z
            .object({ message: z.string() })
            .describe('Session is outside its business day.'),
          201: z
            .object({
              exerciseLog: exerciseLogSchema,
            })
            .describe('Exercise log created successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Session or exercise not found.'),
        },
      },
    },
    createExerciseLogSessionController
  )
}
