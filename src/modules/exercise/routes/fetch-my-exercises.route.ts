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
          'Returns active exercises in the authenticated user library with pagination and optional name and category filters.',
        querystring: fetchMyExercisesQuerySchema,
        response: {
          200: z.object({
            items: z.array(myExerciseSchema),
            page: z.number(),
            pageSize: z.number(),
            total: z.number(),
            totalPages: z.number(),
          }),
        },
      },
    },
    fetchMyExercisesController
  )
}
