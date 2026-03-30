import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWorkoutScheduleDayController } from '../controllers/update-workout-schedule-day.controller'

export function updateWorkoutScheduleDayRoute(app: FastifyInstance) {
  app.put(
    '/workouts/:workoutId/schedules/:scheduleId',
    { onRequest: [verifyJwt] },
    updateWorkoutScheduleDayController
  )
}
