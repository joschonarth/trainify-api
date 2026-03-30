import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { removeExerciseFromWorkoutController } from '../controllers/remove-exercise-from-workout.controller'

export function removeExerciseFromWorkoutRoute(app: FastifyInstance) {
  app.delete(
    '/workouts/:workoutId/exercises/:exerciseId',
    { onRequest: [verifyJwt] },
    removeExerciseFromWorkoutController
  )
}
