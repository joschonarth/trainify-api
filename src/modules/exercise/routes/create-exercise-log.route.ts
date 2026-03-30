import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createExerciseLogController } from '../controllers/create-exercise-log.controller'
import { createExerciseLogBodySchema } from '../schemas/create-exercise-log.schema'
import { exerciseLogSchema } from '../schemas/exercise-log.schema'

export function createExerciseLogRoute(app: FastifyInstance) {
  app.post(
    '/exercise-logs',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercise Logs'],
        summary: 'Create exercise log',
        description:
          'Creates a new exercise log for the authenticated user. If no date is provided, the current date will be used.',
        body: createExerciseLogBodySchema,
        response: {
          201: z
            .object({
              exerciseLog: z.object({
                exerciseLogSchema,
              }),
            })
            .describe('Exercise log created successfully.'),
          409: z
            .object({ message: z.string() })
            .describe('Exercise log already exists for this session.'),
        },
      },
    },
    createExerciseLogController
  )
}
