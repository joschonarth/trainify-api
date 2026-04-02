import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWeightLogController } from '../controllers/update-weight-log.controller'

export function updateWeightLogRoute(app: FastifyInstance) {
  app.put(
    '/weight/logs/:logId',
    { onRequest: [verifyJwt] },
    updateWeightLogController
  )
}
