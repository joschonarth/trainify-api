import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWorkoutsController } from '../controllers/compare-workouts.controller'

export function compareWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/workouts/compare',
    { onRequest: [verifyJwt] },
    compareWorkoutsController
  )
}
