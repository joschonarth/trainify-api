import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWorkoutScheduleDayController } from '../controllers/update-workout-schedule-day.controller'
import {
  updateWorkoutScheduleDayBodySchema,
  updateWorkoutScheduleDayParamsSchema,
} from '../schemas/update-workout-schedule-day.schema'

export function updateWorkoutScheduleDayRoute(app: FastifyInstance) {
  app.put(
    '/workouts/:workoutId/schedules/:scheduleId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Update workout schedule day',
        description:
          'Updates the day of the week for a specific workout schedule.',
        params: updateWorkoutScheduleDayParamsSchema,
        body: updateWorkoutScheduleDayBodySchema,
        response: {
          200: z
            .object({
              schedule: z.object({
                id: z.string().describe('Schedule ID.'),
                workoutId: z.string().describe('Workout ID.'),
                dayOfWeek: z
                  .number()
                  .describe('Day of the week (0 = Sunday, 6 = Saturday).'),
              }),
            })
            .describe('Workout schedule day updated successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout or schedule not found.'),
          409: z
            .object({ message: z.string() })
            .describe('A schedule for this day already exists in the workout.'),
        },
      },
    },
    updateWorkoutScheduleDayController
  )
}
