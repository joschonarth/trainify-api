import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutSessionDetailsController } from '../controllers/get-workout-session-details.controller'

export function getWorkoutSessionDetailsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId',
    { onRequest: [verifyJwt] },
    getWorkoutSessionDetailsController
  )
}
