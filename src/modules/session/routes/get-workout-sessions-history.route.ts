import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutSessionsHistoryController } from '../controllers/get-workout-sessions-history.controller'

export function getWorkoutSessionsHistoryRoute(app: FastifyInstance) {
  app.get(
    '/sessions/history',
    { onRequest: [verifyJwt] },
    getWorkoutSessionsHistoryController
  )
}
