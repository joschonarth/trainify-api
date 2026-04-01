import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { startExerciseTimerController } from '../controllers/start-exercise-timer.controller'

export function startExerciseTimerRoute(app: FastifyInstance) {
  app.post(
    '/sessions/exercises/:exerciseSessionId/start',
    { onRequest: [verifyJwt] },
    startExerciseTimerController
  )
}
