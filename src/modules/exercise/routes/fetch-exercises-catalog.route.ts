import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchExercisesCatalogController } from '../controllers/fetch-exercises-catalog.controller'
import { exerciseSchema } from '../schemas/exercise.schema'
import { fetchExercisesCatalogQuerySchema } from '../schemas/fetch-exercises-catalog.schema'

export function fetchExercisesCatalogRoute(app: FastifyInstance) {
  app.get(
    '/exercises/catalog',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Fetch exercises catalog',
        description:
          'Returns all exercises available in the catalog. Supports filtering by name and category, with pagination.',
        querystring: fetchExercisesCatalogQuerySchema,
        response: {
          200: z
            .object({
              exercises: z.array(exerciseSchema),
            })
            .describe('Catalog exercises fetched successfully.'),
        },
      },
    },
    fetchExercisesCatalogController
  )
}
