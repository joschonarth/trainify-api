import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createExerciseController } from '../controllers/create-exercise.controller'
import { createExerciseBodySchema } from '../schemas/create-exercise.schema'
import { exerciseSchema } from '../schemas/exercise.schema'

export function createExerciseRoute(app: FastifyInstance) {
  app.post(
    '/exercises/my',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Create custom exercise',
        description:
          'Creates a new custom exercise for the authenticated user.',
        body: createExerciseBodySchema,
        response: {
          201: z
            .object({
              exercise: exerciseSchema,
            })
            .describe('Exercise created successfully.'),
          409: z
            .object({ message: z.string() })
            .describe('Exercise with this name already exists.'),
        },
      },
    },
    createExerciseController
  )
}
