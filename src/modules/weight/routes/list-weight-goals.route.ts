import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { listWeightGoalsController } from '../controllers/list-weight-goals.controller'

export function listWeightGoalsRoute(app: FastifyInstance) {
  app.get(
    '/weight/goals',
    { onRequest: [verifyJwt] },
    listWeightGoalsController
  )
}
