import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightGoalLogsController } from '../controllers/get-weight-goal-logs.controller'

export function getWeightGoalLogsRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals/:goalId/logs',
    { onRequest: [verifyJwt] },
    getWeightGoalLogsController
  )
}
