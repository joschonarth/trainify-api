import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deactivateWeightGoalController } from '../controllers/deactivate-weight-goal.controller'

export function deactivateWeightGoalRoute(app: FastifyInstance) {
  app.patch(
    '/weight/goals/:goalId/deactivate',
    { onRequest: [verifyJwt] },
    deactivateWeightGoalController
  )
}
