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
        summary: 'Archive custom exercise',
        description:
          'Archives a custom exercise, removes its library and workout links, and preserves its history and workouts.',
        params: deleteCustomExerciseParamsSchema,
        response: {
          204: z.null().describe('Exercise archived successfully.'),
          403: z
            .object({ message: z.string() })
            .describe(
              'User does not have permission to archive this exercise.'
            ),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found.'),
        },
      },
    },
    deleteCustomExerciseController
  )
}
