import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getMonthlyWorkoutCalendarController } from '../controllers/get-monthly-workout-calendar.controller'
import { getMonthlyWorkoutCalendarQuerySchema } from '../schemas/get-monthly-workout-calendar.schema'

export function getMonthlyWorkoutCalendarRoute(app: FastifyInstance) {
  app.get(
    '/sessions/calendar/monthly',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Get monthly workout calendar',
        description:
          'Returns the workout completion status for each day of a given month. Defaults to the current month if no parameters are provided.',
        querystring: getMonthlyWorkoutCalendarQuerySchema,
        response: {
          200: z
            .object({
              days: z.array(
                z.object({
                  date: z.string().describe('Date in YYYY-MM-DD format.'),
                  completed: z
                    .boolean()
                    .describe('Whether a workout was completed on this day.'),
                })
              ),
            })
            .describe('Monthly workout calendar fetched successfully.'),
        },
      },
    },
    getMonthlyWorkoutCalendarController
  )
}
