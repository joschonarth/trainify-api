import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { addExerciseFromCatalogController } from '../controllers/add-exercise-from-catalog.controller'
import { addExerciseFromCatalogParamsSchema } from '../schemas/add-exercise-from-catalog.schema'

export function addExerciseFromCatalogRoute(app: FastifyInstance) {
  app.post(
    '/exercises/catalog/:id/add',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Add exercise from catalog',
        description:
          'Adds a catalog exercise to the authenticated user library.',
        params: addExerciseFromCatalogParamsSchema,
        response: {
          201: z
            .object({
              myExercise: z.object({
                id: z.string().describe('User exercise relation ID.'),
                exerciseId: z.string().describe('Exercise ID.'),
                userId: z.string().describe('User ID.'),
                createdAt: z.date().describe('Date the exercise was added.'),
              }),
            })
            .describe('Exercise added to library successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found in catalog.'),
          409: z
            .object({ message: z.string() })
            .describe('Exercise already added to user library.'),
        },
      },
    },
    addExerciseFromCatalogController
  )
}
