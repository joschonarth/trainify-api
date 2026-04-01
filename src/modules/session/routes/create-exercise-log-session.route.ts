import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createExerciseLogSessionController } from '../controllers/create-exercise-log-session.controller'

export function createExerciseLogSessionRoute(app: FastifyInstance) {
  app.post(
    '/sessions/:sessionId/logs',
    { onRequest: [verifyJwt] },
    createExerciseLogSessionController
  )
}
