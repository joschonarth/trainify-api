import { FastifyInstance } from 'fastify'

import { getDailyWorkoutSessionController } from '@/controllers/workout-sessions/get-daily-workout-sessions.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function workoutSessionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/workout-sessions/today', getDailyWorkoutSessionController)
}
