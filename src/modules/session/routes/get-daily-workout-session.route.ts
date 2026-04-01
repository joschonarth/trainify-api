import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getDailyWorkoutSessionController } from '../controllers/get-daily-workout-sessions.controller'

export function getDailyWorkoutSessionRoute(app: FastifyInstance) {
  app.get(
    '/sessions/today',
    { onRequest: [verifyJwt] },
    getDailyWorkoutSessionController
  )
}
