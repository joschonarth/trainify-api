import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { compareMonthlyWorkoutsController } from '../controllers/compare-monthly-workouts.controller'
import { compareWeeklyWorkoutsController } from '../controllers/compare-weekly-workouts.controller'
import { compareWorkoutExercisesController } from '../controllers/compare-workout-exercises.controller'
import { compareWorkoutSessionsController } from '../controllers/compare-workout-sessions.controller'
import { completeWorkoutSessionController } from '../controllers/complete-workout-session.controller'
import { createExerciseLogSessionController } from '../controllers/create-exercise-log-session.controller'
import { getDailyWorkoutSessionController } from '../controllers/get-daily-workout-sessions.controller'
import { getMonthlyWorkoutCalendarController } from '../controllers/get-monthly-workout-calendar.controller'
import { getWeeklyWorkoutCalendarController } from '../controllers/get-weekly-workout-calendar.controller'
import { getWorkoutCalendarController } from '../controllers/get-workout-calendar.controller'
import { getWorkoutSessionDetailsController } from '../controllers/get-workout-session-details.controller'
import { getWorkoutSessionsByWorkoutController } from '../controllers/get-workout-sessions-by-workout.controller'
import { getWorkoutSessionsHistoryController } from '../controllers/get-workout-sessions-history.controller'

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
    '/sessions/:workoutId/exercises/comparison',
    compareWorkoutExercisesController,
  )

  app.get(
    '/workouts/:workoutId/sessions',
    getWorkoutSessionsByWorkoutController,
  )

  app.get('/sessions/workouts/compare/weekly', compareWeeklyWorkoutsController)
  app.get(
    '/sessions/workouts/compare/monthly',
    compareMonthlyWorkoutsController,
  )
}
