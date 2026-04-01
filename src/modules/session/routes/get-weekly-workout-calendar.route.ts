import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeeklyWorkoutCalendarController } from '../controllers/get-weekly-workout-calendar.controller'

export function getWeeklyWorkoutCalendarRoute(app: FastifyInstance) {
  app.get(
    '/sessions/calendar/weekly',
    { onRequest: [verifyJwt] },
    getWeeklyWorkoutCalendarController
  )
}
