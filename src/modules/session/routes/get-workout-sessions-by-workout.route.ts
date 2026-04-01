import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutSessionsByWorkoutController } from '../controllers/get-workout-sessions-by-workout.controller'

export function getWorkoutSessionsByWorkoutRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/sessions',
    { onRequest: [verifyJwt] },
    getWorkoutSessionsByWorkoutController
  )
}
