import { FastifyInstance } from 'fastify'

import { completeWorkoutSessionController } from '@/modules/session/controllers/complete-workout-session.controller'
import { createExerciseLogSessionController } from '@/modules/session/controllers/create-exercise-log-session.controller'
import { getDailyWorkoutSessionController } from '@/modules/session/controllers/get-daily-workout-sessions.controller'
import { getMonthlyWorkoutCalendarController } from '@/modules/session/controllers/get-monthly-workout-calendar.controller'
import { getWeeklyWorkoutCalendarController } from '@/modules/session/controllers/get-weekly-workout-calendar.controller'
import { getWorkoutCalendarController } from '@/modules/session/controllers/get-workout-calendar.controller'
import { getWorkoutSessionDetailsController } from '@/modules/session/controllers/get-workout-session-details.controller'
import { getWorkoutSessionsHistoryController } from '@/modules/session/controllers/get-workout-sessions-history.controller'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { compareWorkoutSessionsController } from '../controllers/compare-workout-sessions.controller'
import { getWorkoutSessionsByWorkoutController } from '../controllers/get-workout-sessions-by-workout.controller'

export async function sessionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/sessions/today', getDailyWorkoutSessionController)
  app.get('/sessions/:sessionId', getWorkoutSessionDetailsController)

  app.get('/sessions/calendar/weekly', getWeeklyWorkoutCalendarController)
  app.get('/sessions/calendar/monthly', getMonthlyWorkoutCalendarController)
  app.get('/sessions/calendar', getWorkoutCalendarController)

  app.get('/sessions/history', getWorkoutSessionsHistoryController)

  app.post('/sessions/:sessionId/logs', createExerciseLogSessionController)

  app.post('/sessions/:sessionId/complete', completeWorkoutSessionController)

  app.get('/sessions/:workoutId/comparison', compareWorkoutSessionsController)

  app.get(
    '/workouts/:workoutId/sessions',
    getWorkoutSessionsByWorkoutController,
  )
}
