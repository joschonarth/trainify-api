import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { completeExerciseSessionController } from '../controllers/complete-exercise-session.controller'

export function completeExerciseSessionRoute(app: FastifyInstance) {
  app.patch(
    '/sessions/exercises/:exerciseSessionId/complete',
    { onRequest: [verifyJwt] },
    completeExerciseSessionController
  )
}
