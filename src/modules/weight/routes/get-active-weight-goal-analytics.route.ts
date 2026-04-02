import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getActiveWeightGoalAnalyticsController } from '../controllers/get-active-weight-goal-analytics.controller'

export function getActiveWeightGoalAnalyticsRoute(app: FastifyInstance) {
  app.get(
    '/weight/analytics/goal',
    { onRequest: [verifyJwt] },
    getActiveWeightGoalAnalyticsController
  )
}
