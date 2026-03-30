import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutStatsController } from '../controllers/get-workout-stats.controller'

export function getWorkoutStatsRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/stats',
    { onRequest: [verifyJwt] },
    getWorkoutStatsController
  )
}
