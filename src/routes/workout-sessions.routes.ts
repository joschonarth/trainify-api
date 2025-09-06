import { FastifyInstance } from 'fastify'

import { completeWorkoutSessionController } from '@/controllers/workout-sessions/complete-workout-session.controller'
import { createExerciseLogSessionController } from '@/controllers/workout-sessions/create-exercise-log-session.controller'
import { getDailyWorkoutSessionController } from '@/controllers/workout-sessions/get-daily-workout-sessions.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function workoutSessionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/workout-sessions/today', getDailyWorkoutSessionController)
  app.post('/sessions/:sessionId/logs', createExerciseLogSessionController)
  app.patch('/sessions/:sessionId/complete', completeWorkoutSessionController)
}
