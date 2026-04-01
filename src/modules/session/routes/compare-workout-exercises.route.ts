import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWorkoutExercisesController } from '../controllers/compare-workout-exercises.controller'

export function compareWorkoutExercisesRoute(app: FastifyInstance) {
  app.get(
    '/sessions/:workoutId/exercises/comparison',
    { onRequest: [verifyJwt] },
    compareWorkoutExercisesController
  )
}
