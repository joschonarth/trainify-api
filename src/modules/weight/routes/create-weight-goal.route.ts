import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createWeightGoalController } from '../controllers/create-weight-goal.controller'

export function createWeightGoalRoute(app: FastifyInstance) {
  app.post(
    '/weight/goals',
    { onRequest: [verifyJwt] },
    createWeightGoalController
  )
}
