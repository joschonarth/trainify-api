import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWorkoutSessionsController } from '../controllers/compare-workout-sessions.controller'

export function compareWorkoutSessionsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/:workoutId/comparison',
    { onRequest: [verifyJwt] },
    compareWorkoutSessionsController
  )
}
