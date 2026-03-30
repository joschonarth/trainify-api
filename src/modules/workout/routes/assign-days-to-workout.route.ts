import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { assignDaysToWorkoutController } from '../controllers/assign-days-to-workout.controller'

export function assignDaysToWorkoutRoute(app: FastifyInstance) {
  app.post(
    '/workouts/:workoutId/schedules',
    { onRequest: [verifyJwt] },
    assignDaysToWorkoutController
  )
}
