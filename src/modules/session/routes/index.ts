import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { compareMonthlyWorkoutsController } from '../controllers/compare-monthly-workouts.controller'
import { compareWeeklyWorkoutsController } from '../controllers/compare-weekly-workouts.controller'
import { compareWorkoutExercisesController } from '../controllers/compare-workout-exercises.controller'
import { compareWorkoutSessionsController } from '../controllers/compare-workout-sessions.controller'
import { compareWorkoutsController } from '../controllers/compare-workouts.controller'
import { completeWorkoutSessionController } from '../controllers/complete-workout-session.controller'
import { createExerciseLogSessionController } from '../controllers/create-exercise-log-session.controller'
import { finishWorkoutSessionController } from '../controllers/finish-workout-session.controller'
import { getDailyWorkoutSessionController } from '../controllers/get-daily-workout-sessions.controller'
import { getMonthlyWorkoutCalendarController } from '../controllers/get-monthly-workout-calendar.controller'
import { getWeeklyWorkoutCalendarController } from '../controllers/get-weekly-workout-calendar.controller'
import { getWorkoutCalendarController } from '../controllers/get-workout-calendar.controller'
import { getWorkoutSessionDetailsController } from '../controllers/get-workout-session-details.controller'
import { getWorkoutSessionsByWorkoutController } from '../controllers/get-workout-sessions-by-workout.controller'
import { getWorkoutSessionsHistoryController } from '../controllers/get-workout-sessions-history.controller'
import { startExerciseTimerController } from '../controllers/start-exercise-timer.controller'
import { startWorkoutSessionController } from '../controllers/start-workout-session.controller'
import { stopExerciseTimerController } from '../controllers/stop-exercise-timer.controller'

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

  app.get('/sessions/workouts/compare', compareWorkoutsController)
  app.get('/sessions/workouts/compare/weekly', compareWeeklyWorkoutsController)
  app.get(
    '/sessions/workouts/compare/monthly',
    compareMonthlyWorkoutsController,
  )

  app.post('/sessions/:sessionId/start', startWorkoutSessionController)
  app.post('/sessions/:sessionId/finish', finishWorkoutSessionController)

  app.post(
    '/sessions/exercises/:exerciseSessionId/start',
    startExerciseTimerController,
  )
  app.post(
    '/sessions/exercises/:exerciseSessionId/stop',
    stopExerciseTimerController,
  )
}
