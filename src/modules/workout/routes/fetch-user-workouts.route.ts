import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserWorkoutsController } from '../controllers/fetch-user-workouts.controller'
import { workoutSchema } from '../schemas/workout.schema'

export function fetchUserWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/workouts',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Fetch user workouts',
        description:
          'Returns all workouts from the authenticated user, including their exercises and schedules.',
        response: {
          200: z
            .object({
              workouts: z.array(workoutSchema),
            })
            .describe('Workouts fetched successfully.'),
        },
      },
    },
    fetchUserWorkoutsController
  )
}
