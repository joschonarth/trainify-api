import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteWeightLogController } from '../controllers/delete-weight-log.controller'

export function deleteWeightLogRoute(app: FastifyInstance) {
  app.delete(
    '/weight/logs/:logId',
    { onRequest: [verifyJwt] },
    deleteWeightLogController
  )
}
