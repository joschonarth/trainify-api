import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseLogController } from '../controllers/get-exercise-log.controller'

export function getExerciseLogRoute(app: FastifyInstance) {
  app.get(
    '/exercise-logs/:id',
    { onRequest: [verifyJwt] },
    getExerciseLogController
  )
}
