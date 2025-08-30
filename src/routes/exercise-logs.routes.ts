import { FastifyInstance } from 'fastify'

import { createExerciseLogController } from '@/controllers/exercise-logs/create-exercise-log.controller'
import { fetchExerciseLogsController } from '@/controllers/exercise-logs/fetch-exercise-logs.controller'
import { getExerciseLogController } from '@/controllers/exercise-logs/get-exercise-log.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function exerciseLogsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/exercise-logs', fetchExerciseLogsController)
  app.get('/exercise-logs/:id', getExerciseLogController)

  app.post('/exercise-logs', createExerciseLogController)
}
