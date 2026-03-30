import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { removeWorkoutScheduleDayController } from '../controllers/remove-workout-schedule-day.controller'

export function removeWorkoutScheduleDayRoute(app: FastifyInstance) {
  app.delete(
    '/workouts/:workoutId/schedules/:scheduleId',
    { onRequest: [verifyJwt] },
    removeWorkoutScheduleDayController
  )
}
