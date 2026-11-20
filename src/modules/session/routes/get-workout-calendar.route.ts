import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutCalendarController } from '../controllers/get-workout-calendar.controller'
import { getWorkoutCalendarQuerySchema } from '../schemas/get-workout-calendar.schema'
import { calendarDaySchema } from '../schemas/session-calendar.schema'

export function getWorkoutCalendarRoute(app: FastifyInstance) {
  app.get(
    '/sessions/calendar',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Get workout calendar',
        description:
          'Returns the workout completion status for each day of a given month. Defaults to the current month if no parameters are provided.',
        querystring: getWorkoutCalendarQuerySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          200: z
            .object({
              days: z.array(calendarDaySchema),
            })
            .describe('Workout calendar fetched successfully.'),
        },
      },
    },
    getWorkoutCalendarController
  )
}
