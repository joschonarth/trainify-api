import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutDetailsController } from '../controllers/get-workout-details'
import { getWorkoutDetailsParamsSchema } from '../schemas/get-workout-details.schema'
import { workoutSchema } from '../schemas/workout.schema'

export function getWorkoutDetailsRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Get workout details',
        description:
          'Returns the details of a specific workout, including its exercises and schedules.',
        params: getWorkoutDetailsParamsSchema,
        response: {
          200: z
            .object({
              workoutSchema,
            })
            .describe('Workout details fetched successfully.'),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    getWorkoutDetailsController
  )
}
