import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateExerciseController } from '../controllers/update-exercise.controller'

export function updateExerciseRoute(app: FastifyInstance) {
  app.put(
    '/exercises/:exerciseId',
    { onRequest: [verifyJwt] },
    updateExerciseController
  )
}
