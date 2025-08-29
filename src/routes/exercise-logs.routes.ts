import { FastifyInstance } from 'fastify'

import { createExerciseLogController } from '@/controllers/exercise-logs/create-exercise-log.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function exerciseLogsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.post('/exercise-logs', createExerciseLogController)
}
