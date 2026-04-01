import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { removeWorkoutScheduleDayController } from '../controllers/remove-workout-schedule-day.controller'
import { removeWorkoutScheduleDayParamsSchema } from '../schemas/remove-workout-schedule-day.schema'

export function removeWorkoutScheduleDayRoute(app: FastifyInstance) {
  app.delete(
    '/workouts/:workoutId/schedules/:scheduleId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Remove workout schedule day',
        description: 'Removes a scheduled day from a specific workout.',
        params: removeWorkoutScheduleDayParamsSchema,
        response: {
          204: z.null().describe('Workout schedule day removed successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout or schedule not found.'),
        },
      },
    },
    removeWorkoutScheduleDayController
  )
}
