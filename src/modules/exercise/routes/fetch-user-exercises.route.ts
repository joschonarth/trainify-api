import type { FastifyInstance } from 'fastify'
import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserExercisesController } from '../controllers/fetch-user-exercises.controller'
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
              exercises: z.array(
                z.object({
                  id: z.string().describe('Exercise ID.'),
                  name: z.string().describe('Exercise name.'),
                  category: z
                    .enum(ExerciseCategory)
                    .describe('Exercise category.'),
                  type: z.enum(ExerciseType).describe('Exercise type.'),
                  description: z
                    .string()
                    .nullable()
                    .describe('Exercise description.'),
                  isCustom: z
                    .boolean()
                    .describe('Whether the exercise was created by the user.'),
                })
              ),
            })
            .describe('Exercises fetched successfully.'),
        },
      },
    },
    fetchUserExercisesController
  )
}
