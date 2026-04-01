import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWeeklyWorkoutsController } from '../controllers/compare-weekly-workouts.controller'

export function compareWeeklyWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/workouts/compare/weekly',
    { onRequest: [verifyJwt] },
    compareWeeklyWorkoutsController
  )
}
