import { FastifyInstance } from 'fastify'

import { createExerciseLogSessionController } from '@/controllers/workout-sessions/create-exercise-log-session.controller'
import { getDailyWorkoutSessionController } from '@/controllers/workout-sessions/get-daily-workout-sessions.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function workoutSessionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/workout-sessions/today', getDailyWorkoutSessionController)
  app.post('/sessions/:sessionId/logs', createExerciseLogSessionController)
}
