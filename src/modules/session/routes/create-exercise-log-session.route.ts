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
        tags: ['Sessions'],
        summary: 'Create exercise log session',
        description:
          'Creates an exercise log entry for a specific workout session.',
        params: createExerciseLogSessionParamsSchema,
        body: createExerciseLogSessionBodySchema,
        response: {
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
