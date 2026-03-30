import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchWorkoutExercisesController } from '../controllers/fetch-workout-exercises.controller'

export function fetchWorkoutExercisesRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/exercises',
    { onRequest: [verifyJwt] },
    fetchWorkoutExercisesController
  )
}
