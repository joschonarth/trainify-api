import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteWeightGoalController } from '../controllers/delete-weight-goal.controller'

export function deleteWeightGoalRoute(app: FastifyInstance) {
  app.delete(
    '/weight/goals/:goalId',
    { onRequest: [verifyJwt] },
    deleteWeightGoalController
  )
}
