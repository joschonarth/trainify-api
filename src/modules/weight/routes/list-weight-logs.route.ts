import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { listWeightLogsController } from '../controllers/list-weight-logs.controller'

export function listWeightLogsRoute(app: FastifyInstance) {
  app.get('/weight/logs', { onRequest: [verifyJwt] }, listWeightLogsController)
}
