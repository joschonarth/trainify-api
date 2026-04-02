import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWeightGoalController } from '../controllers/get-weight-goal.controller'

export function getWeightGoalRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals/:goalId',
    { onRequest: [verifyJwt] },
    getWeightGoalController
  )
}
