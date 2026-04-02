import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getGeneralWeightAnalyticsController } from '../controllers/get-general-weight-analytics.controller'

export function getGeneralWeightAnalyticsRoute(app: FastifyInstance) {
  app.get(
    '/weight/analytics/general',
    { onRequest: [verifyJwt] },
    getGeneralWeightAnalyticsController
  )
}
