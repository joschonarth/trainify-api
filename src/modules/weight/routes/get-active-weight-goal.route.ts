import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getActiveWeightGoalController } from '../controllers/get-active-weight-goal.controller'

export function getActiveWeightGoalRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals/active',
    { onRequest: [verifyJwt] },
    getActiveWeightGoalController
  )
}
