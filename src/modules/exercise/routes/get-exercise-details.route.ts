import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseDetailsController } from '../controllers/get-exercise-details.controller'
import { exerciseSchema } from '../schemas/exercise.schema'
import { getExerciseDetailsParamsSchema } from '../schemas/get-exercise-details.schema'

export function getExerciseDetailsRoute(app: FastifyInstance) {
  app.get(
    '/exercises/:id',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Get exercise details',
        description:
          'Returns the details of a specific exercise by ID. The authenticated user must own the exercise or have access to it.',
        params: getExerciseDetailsParamsSchema,
        response: {
          200: z
            .object({
              exercise: exerciseSchema,
            })
            .describe('Exercise details fetched successfully.'),
          403: z
            .object({ message: z.string() })
            .describe('User does not have access to this exercise.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found.'),
        },
      },
    },
    getExerciseDetailsController
  )
}
