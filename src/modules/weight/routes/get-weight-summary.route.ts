import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightSummaryController } from '../controllers/get-weight-summary.controller'

export function getWeightSummaryRoute(app: FastifyInstance) {
  app.get(
    '/weight/summary',
    { onRequest: [verifyJwt] },
    getWeightSummaryController
  )
}
