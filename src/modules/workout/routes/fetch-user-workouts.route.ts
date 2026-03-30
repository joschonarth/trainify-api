import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserWorkoutsController } from '../controllers/fetch-user-workouts.controller'
import { workoutSchema } from '../schemas/workout.schema'

const fetchWorkoutSchema = workoutSchema.extend({
  exercises: z.array(
    workoutSchema.shape.exercises.element.omit({ workoutId: true })
  ),
  schedules: z.array(
    workoutSchema.shape.schedules.element.omit({
      userId: true,
      workoutId: true,
    })
  ),
})

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
              workouts: z.array(fetchWorkoutSchema),
            })
            .describe('Workouts fetched successfully.'),
        },
      },
    },
    fetchUserWorkoutsController
  )
}
