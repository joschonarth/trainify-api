import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateExerciseController } from '../controllers/update-exercise.controller'
import { exerciseSchema } from '../schemas/exercise.schema'
import {
  updateExerciseBodySchema,
  updateExerciseParamsSchema,
} from '../schemas/update-exercise.schema'

export function updateExerciseRoute(app: FastifyInstance) {
  app.put(
    '/exercises/:exerciseId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Update exercise',
        description:
          'Updates a custom exercise owned by the authenticated user. All fields are optional — only provided fields will be updated.',
        params: updateExerciseParamsSchema,
        body: updateExerciseBodySchema,
        response: {
          200: z
            .object({
              exercise: exerciseSchema,
            })
            .describe('Exercise updated successfully.'),
          403: z
            .object({ message: z.string() })
            .describe('User does not have permission to update this exercise.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found.'),
        },
      },
    },
    updateExerciseController
  )
}
