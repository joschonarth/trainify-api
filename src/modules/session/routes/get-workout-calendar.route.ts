import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutCalendarController } from '../controllers/get-workout-calendar.controller'

export function getWorkoutCalendarRoute(app: FastifyInstance) {
  app.get(
    '/sessions/calendar',
    { onRequest: [verifyJwt] },
    getWorkoutCalendarController
  )
}
