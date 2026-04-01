import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseSessionDetailsController } from '../controllers/get-exercise-session-details.controller'

export function getExerciseSessionDetailsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/exercises/:exerciseSessionId',
    { onRequest: [verifyJwt] },
    getExerciseSessionDetailsController
  )
}
