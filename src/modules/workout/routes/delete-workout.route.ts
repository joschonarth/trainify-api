import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteWorkoutController } from '../controllers/delete-workout.controller'

export function deleteWorkoutRoute(app: FastifyInstance) {
  app.delete(
    '/workouts/:workoutId',
    { onRequest: [verifyJwt] },
    deleteWorkoutController
  )
}
