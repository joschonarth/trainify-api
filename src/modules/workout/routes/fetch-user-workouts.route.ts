import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserWorkoutsController } from '../controllers/fetch-user-workouts.controller'

export function fetchUserWorkoutsRoute(app: FastifyInstance) {
  app.get('/workouts', { onRequest: [verifyJwt] }, fetchUserWorkoutsController)
}
