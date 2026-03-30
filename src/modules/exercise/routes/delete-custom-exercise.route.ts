import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteCustomExerciseController } from '../controllers/delete-custom-exercise.controller'
import { deleteCustomExerciseParamsSchema } from '../schemas/delete-custom-exercise.schema'

export function deleteCustomExerciseRoute(app: FastifyInstance) {
  app.delete(
    '/exercises/my/custom/:exerciseId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Delete custom exercise',
        description:
          'Deletes a custom exercise owned by the authenticated user.',
        params: deleteCustomExerciseParamsSchema,
        response: {
          204: z.null().describe('Exercise deleted successfully.'),
          403: z
            .object({ message: z.string() })
            .describe('User does not have permission to delete this exercise.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found.'),
        },
      },
    },
    deleteCustomExerciseController
  )
}
