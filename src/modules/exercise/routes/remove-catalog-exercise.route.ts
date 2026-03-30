import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { removeCatalogExerciseController } from '../controllers/remove-catalog-exercise.controller'
import { removeCatalogExerciseParamsSchema } from '../schemas/remove-catalog-exercise.schema'

export function removeCatalogExerciseRoute(app: FastifyInstance) {
  app.delete(
    '/exercises/my/catalog/:id',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Remove catalog exercise',
        description:
          'Removes a catalog exercise from the authenticated user library.',
        params: removeCatalogExerciseParamsSchema,
        response: {
          204: z.null().describe('Exercise removed from library successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found in user library.'),
        },
      },
    },
    removeCatalogExerciseController
  )
}
