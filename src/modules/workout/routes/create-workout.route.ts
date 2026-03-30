import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createWorkoutController } from '../controllers/create-workout.controller'

export function createWorkoutRoute(app: FastifyInstance) {
  app.post('/workouts', { onRequest: [verifyJwt] }, createWorkoutController)
}
