import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { addExerciseToWorkoutController } from '../controllers/add-exercise-to-workout.controller'

export function addExerciseToWorkoutRoute(app: FastifyInstance) {
  app.post(
    '/workouts/:workoutId/exercises',
    { onRequest: [verifyJwt] },
    addExerciseToWorkoutController
  )
}
