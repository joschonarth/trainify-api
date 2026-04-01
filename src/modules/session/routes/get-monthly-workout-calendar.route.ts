import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getMonthlyWorkoutCalendarController } from '../controllers/get-monthly-workout-calendar.controller'

export function getMonthlyWorkoutCalendarRoute(app: FastifyInstance) {
  app.get(
    '/sessions/calendar/monthly',
    { onRequest: [verifyJwt] },
    getMonthlyWorkoutCalendarController
  )
}
