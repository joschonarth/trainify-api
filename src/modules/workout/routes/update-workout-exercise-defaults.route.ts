import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWorkoutExerciseDefaultsController } from '../controllers/update-workout-exercise-defaults.controller'

export function updateWorkoutExerciseDefaultsRoute(app: FastifyInstance) {
  app.put(
    '/workouts/:workoutId/exercises/:exerciseId',
    { onRequest: [verifyJwt] },
    updateWorkoutExerciseDefaultsController
  )
}
