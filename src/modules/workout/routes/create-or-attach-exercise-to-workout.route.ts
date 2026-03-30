import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createOrAttachExerciseToWorkoutController } from '../controllers/create-or-attach-exercise-to-workout.controller'

export function createOrAttachExerciseToWorkoutRoute(app: FastifyInstance) {
  app.post(
    '/workouts/:workoutId/exercises/create-or-attach',
    { onRequest: [verifyJwt] },
    createOrAttachExerciseToWorkoutController
  )
}
