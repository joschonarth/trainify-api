import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchMyExercisesController } from '../controllers/fetch-my-exercises.controller'
import { fetchMyExercisesQuerySchema } from '../schemas/fetch-my-exercises.schema'
import { myExerciseSchema } from '../schemas/my-exercise.schema'

export function fetchMyExercisesRoute(app: FastifyInstance) {
  app.get(
    '/exercises/my',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Fetch my exercises',
        description:
          'Returns all exercises added to the authenticated user library, including custom and catalog exercises. Supports filtering by name and category, with pagination.',
        querystring: fetchMyExercisesQuerySchema,
        response: {
          200: z
            .object({
              myExercises: z.array(myExerciseSchema),
            })
            .describe('My exercises fetched successfully.'),
        },
      },
    },
    fetchMyExercisesController
  )
}
