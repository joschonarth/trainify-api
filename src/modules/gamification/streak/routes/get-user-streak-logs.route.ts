import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserStreakLogsController } from '../controllers/get-user-streak-logs.controller'
import { getUserStreakLogsQuerySchema } from '../schemas/get-user-streak-logs.schema'

export function getUserStreakLogsRoute(app: FastifyInstance) {
  app.get<{ Querystring: { startDate?: string; endDate?: string } }>(
    '/streak/logs',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Gamification'],
        summary: 'Get user streak logs',
        description:
          'Returns the streak logs for the authenticated user. Optionally filter by date range.',
        querystring: getUserStreakLogsQuerySchema,
        response: {
          200: z
            .object({
              logs: z.array(
                z.object({
                  id: z.string().describe('Log ID.'),
                  userId: z.string().describe('User ID.'),
                  date: z.date().describe('Date of the workout log.'),
                  createdAt: z.date().describe('Date the log was created.'),
                })
              ),
            })
            .describe('Streak logs fetched successfully.'),
        },
      },
    },
    getUserStreakLogsController
  )
}
