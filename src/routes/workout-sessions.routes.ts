import { FastifyInstance } from 'fastify'

import { completeWorkoutSessionController } from '@/controllers/workout-sessions/complete-workout-session.controller'
import { createExerciseLogSessionController } from '@/controllers/workout-sessions/create-exercise-log-session.controller'
import { getDailyWorkoutSessionController } from '@/controllers/workout-sessions/get-daily-workout-sessions.controller'
import { getWorkoutSessionDetailsController } from '@/controllers/workout-sessions/get-workout-session-details.controller'
import { getWorkoutSessionsHistoryController } from '@/controllers/workout-sessions/get-workout-sessions-history.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function workoutSessionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/workout-sessions/today', getDailyWorkoutSessionController)
  app.get('/workout-sessions/history', getWorkoutSessionsHistoryController)
  app.get('/workout-sessions/:sessionId', getWorkoutSessionDetailsController)

  app.post(
    '/workout-sessions/:sessionId/logs',
    createExerciseLogSessionController,
  )

  app.post(
    '/workout-sessions/:sessionId/complete',
    completeWorkoutSessionController,
  )
}
