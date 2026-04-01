import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserStreakCalendarController } from '../controllers/get-user-streak-calendar.controller'

export function getUserStreakCalendarRoute(app: FastifyInstance) {
  app.get(
    '/streak/calendar',
    { onRequest: [verifyJwt] },
    getUserStreakCalendarController
  )
}
