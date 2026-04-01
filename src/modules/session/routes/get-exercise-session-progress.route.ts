import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseSessionProgressController } from '../controllers/get-exercise-session-progress.controller'

export function getExerciseSessionProgressRoute(app: FastifyInstance) {
  app.get(
    '/sessions/exercises/:exerciseId/progress',
    { onRequest: [verifyJwt] },
    getExerciseSessionProgressController
  )
}
