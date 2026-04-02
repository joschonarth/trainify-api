import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeeklyWorkoutCalendarController } from '../controllers/get-weekly-workout-calendar.controller'

export function getWeeklyWorkoutCalendarRoute(app: FastifyInstance) {
  app.get(
    '/sessions/calendar/weekly',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Get weekly workout calendar',
        description:
          'Returns the workout completion status for each day of the current week for the authenticated user.',
        response: {
          200: z
            .object({
              week: z.array(
                z.object({
                  date: z.string().describe('Date in YYYY-MM-DD format.'),
                  completed: z
                    .boolean()
                    .describe('Whether a workout was completed on this day.'),
                })
              ),
            })
            .describe('Weekly workout calendar fetched successfully.'),
        },
      },
    },
    getWeeklyWorkoutCalendarController
  )
}
