import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserWorkoutsController } from '../controllers/fetch-user-workouts.controller'
import { fetchUserWorkoutsQuerySchema } from '../schemas/fetch-user-workouts.schema'
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
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Workouts'],
        summary: 'Fetch user workouts',
        description:
          'Returns a page of active workouts from the authenticated user, optionally filtered by name.',
        querystring: fetchUserWorkoutsQuerySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              workouts: z.array(fetchWorkoutSchema),
              pagination: z.object({
                page: z.number().describe('Current page, starting at 1.'),
                pageSize: z.number().describe('Number of workouts per page.'),
                total: z.number().describe('Total matching workouts.'),
                totalPages: z
                  .number()
                  .describe('Total number of result pages.'),
              }),
            })
            .describe('Workouts fetched successfully.'),
        },
      },
    },
    fetchUserWorkoutsController
  )
}
