import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { startWorkoutSessionController } from '../controllers/start-workout-session.controller'

export function startWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/start',
    { onRequest: [verifyJwt] },
    startWorkoutSessionController
  )
}
