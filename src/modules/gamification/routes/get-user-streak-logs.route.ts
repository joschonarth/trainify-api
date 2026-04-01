import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserStreakLogsController } from '../controllers/get-user-streak-logs.controller'

export function getUserStreakLogsRoute(app: FastifyInstance) {
  app.get<{ Querystring: { startDate?: string; endDate?: string } }>(
    '/streak/logs',
    { onRequest: [verifyJwt] },
    getUserStreakLogsController
  )
}
