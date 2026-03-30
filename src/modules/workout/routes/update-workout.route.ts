import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWorkoutController } from '../controllers/update-workout.controller'

export function updateWorkoutRoute(app: FastifyInstance) {
  app.put(
    '/workouts/:workoutId',
    { onRequest: [verifyJwt] },
    updateWorkoutController
  )
}
