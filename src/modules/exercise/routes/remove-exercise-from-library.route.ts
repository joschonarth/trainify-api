import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { removeExerciseFromLibraryController } from '../controllers/remove-exercise-from-library.controller'
import { removeExerciseFromLibraryParamsSchema } from '../schemas/remove-exercise-from-library.schema'

export function removeExerciseFromLibraryRoute(app: FastifyInstance) {
  app.delete(
    '/exercises/my/:exerciseId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Remove exercise from library',
        description:
          'Removes a catalog exercise from the authenticated user library or archives their custom exercise. Catalog exercises used in workouts cannot be removed.',
        params: removeExerciseFromLibraryParamsSchema,
        response: {
          204: z.null().describe('Exercise removed from library successfully.'),
          403: z
            .object({ message: z.string() })
            .describe('User does not have permission to remove this exercise.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found in user library.'),
          409: z
            .object({
              message: z.string(),
              workouts: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                })
              ),
            })
            .describe(
              'Exercise is used by one or more workouts and cannot be removed.'
            ),
        },
      },
    },
    removeExerciseFromLibraryController
  )
}
