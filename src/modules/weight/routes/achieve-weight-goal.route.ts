import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { achieveWeightGoalController } from '../controllers/achieve-weight-goal.controller'

export function achieveWeightGoalRoute(app: FastifyInstance) {
  app.patch<{ Params: { goalId: string } }>(
    '/weight/goals/:goalId/achieve',
    { onRequest: [verifyJwt] },
    achieveWeightGoalController
  )
}
