import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createExerciseLogController } from '../controllers/create-exercise-log.controller'

export function createExerciseLogRoute(app: FastifyInstance) {
  app.post(
    '/exercise-logs',
    { onRequest: [verifyJwt] },
    createExerciseLogController
  )
}
