import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWeightGoalController } from '../controllers/update-weight-goal.controller'

export function updateWeightGoalRoute(app: FastifyInstance) {
  app.put(
    '/weight/goals/:goalId',
    { onRequest: [verifyJwt] },
    updateWeightGoalController
  )
}
