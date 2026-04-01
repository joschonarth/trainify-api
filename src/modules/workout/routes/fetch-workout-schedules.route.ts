import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchWorkoutSchedulesController } from '../controllers/fetch-workout-schedules.controller'
import { fetchWorkoutSchedulesParamsSchema } from '../schemas/fetch-workout-schedules.schema'
import { workoutScheduleSchema } from '../schemas/workout.schema'

export function fetchWorkoutSchedulesRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/schedules',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Fetch workout schedules',
        description: 'Returns all scheduled days for a specific workout.',
        params: fetchWorkoutSchedulesParamsSchema,
        response: {
          200: z
            .object({
              schedules: z.array(workoutScheduleSchema),
            })
            .describe('Workout schedules fetched successfully.'),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    fetchWorkoutSchedulesController
  )
}
