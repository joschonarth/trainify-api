import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserExercisesController } from '../controllers/fetch-user-exercises.controller'
import { exerciseSchema } from '../schemas/exercise.schema'
import { fetchUserExercisesQuerySchema } from '../schemas/fetch-user-exercises.schema'

export function fetchUserExercisesRoute(app: FastifyInstance) {
  app.get(
    '/exercises',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Fetch user exercises',
        description:
          'Returns all exercises available to the authenticated user, including their own custom exercises and exercises added from the catalog. Supports filtering by name, category and type.',
        querystring: fetchUserExercisesQuerySchema,
        response: {
          200: z
            .object({
              exercises: z.array(exerciseSchema),
            })
            .describe('Exercises fetched successfully.'),
        },
      },
    },
    fetchUserExercisesController
  )
}
