import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createWeightLogController } from '../controllers/create-weight-log.controller'

export function createWeightLogRoute(app: FastifyInstance) {
  app.post(
    '/weight/logs',
    { onRequest: [verifyJwt] },
    createWeightLogController
  )
}
