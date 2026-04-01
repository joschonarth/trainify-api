import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { finishWorkoutSessionController } from '../controllers/finish-workout-session.controller'

export function finishWorkoutSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/finish',
    { onRequest: [verifyJwt] },
    finishWorkoutSessionController
  )
}
