import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseProgressController } from '../controllers/get-exercise-progress.controller'

export function getExerciseProgressRoute(app: FastifyInstance) {
  app.get(
    '/exercises/:exerciseId/progress',
    { onRequest: [verifyJwt] },
    getExerciseProgressController
  )
}
