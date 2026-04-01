import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { completeWorkoutSessionController } from '../controllers/complete-workout-session.controller'

export function completeWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/complete',
    { onRequest: [verifyJwt] },
    completeWorkoutSessionController
  )
}
