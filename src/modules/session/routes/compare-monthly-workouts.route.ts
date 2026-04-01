import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareMonthlyWorkoutsController } from '../controllers/compare-monthly-workouts.controller'

export function compareMonthlyWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/workouts/compare/monthly',
    { onRequest: [verifyJwt] },
    compareMonthlyWorkoutsController
  )
}
