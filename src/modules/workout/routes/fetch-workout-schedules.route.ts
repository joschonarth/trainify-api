import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchWorkoutSchedulesController } from '../controllers/fetch-workout-schedules.controller'

export function fetchWorkoutSchedulesRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/schedules',
    { onRequest: [verifyJwt] },
    fetchWorkoutSchedulesController
  )
}
