import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightLogController } from '../controllers/get-weight-log.controller'

export function getWeightLogRoute(app: FastifyInstance) {
  app.get(
    '/weight/logs/:logId',
    { onRequest: [verifyJwt] },
    getWeightLogController
  )
}
