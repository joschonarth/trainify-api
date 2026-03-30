import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutDetailsController } from '../controllers/get-workout-details'

export function getWorkoutDetailsRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId',
    { onRequest: [verifyJwt] },
    getWorkoutDetailsController
  )
}
