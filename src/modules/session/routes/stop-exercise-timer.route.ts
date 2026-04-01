import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { stopExerciseTimerController } from '../controllers/stop-exercise-timer.controller'

export function stopExerciseTimerRoute(app: FastifyInstance) {
  app.post(
    '/sessions/exercises/:exerciseSessionId/stop',
    { onRequest: [verifyJwt] },
    stopExerciseTimerController
  )
}
