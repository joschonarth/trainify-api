import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserStreakCalendarController } from '../controllers/get-user-streak-calendar.controller'
import { getUserStreakCalendarQuerySchema } from '../schemas/get-user-streak-calendar.schema'

export function getUserStreakCalendarRoute(app: FastifyInstance) {
  app.get(
    '/streak/calendar',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Gamification'],
        summary: 'Get user streak calendar',
        description:
          'Returns the workout completion status for each day of a given month and year for the authenticated user.',
        querystring: getUserStreakCalendarQuerySchema,
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
            .describe('Streak calendar fetched successfully.'),
        },
      },
    },
    getUserStreakCalendarController
  )
}
