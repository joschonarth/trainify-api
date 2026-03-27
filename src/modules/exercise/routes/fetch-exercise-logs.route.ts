import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchExerciseLogsController } from '../controllers/fetch-exercise-logs.controller'

export function fetchExerciseLogsRoute(app: FastifyInstance) {
  app.get(
    '/exercise-logs',
    { onRequest: [verifyJwt] },
    fetchExerciseLogsController
  )
}
