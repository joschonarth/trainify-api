import type { FastifyInstance } from 'fastify'

import { compareMonthlyWorkoutsRoute } from './compare-monthly-workouts.route'
import { compareWeeklyWorkoutsRoute } from './compare-weekly-workouts.route'
import { compareWorkoutExercisesRoute } from './compare-workout-exercises.route'
import { compareWorkoutSessionsRoute } from './compare-workout-sessions.route'
import { compareWorkoutsRoute } from './compare-workouts.route'
import { completeExerciseSessionRoute } from './complete-exercise-session.route'
import { completeWorkoutSessionRoute } from './complete-workout-session.route'
import { createExerciseLogSessionRoute } from './create-exercise-log-session.route'
import { finishWorkoutSessionRoute } from './finish-workout-session.route'
import { getDailyWorkoutSessionRoute } from './get-daily-workout-session.route'
import { getExerciseSessionDetailsRoute } from './get-exercise-session-details.route'
import { getExerciseSessionProgressRoute } from './get-exercise-session-progress.route'
import { getMonthlyWorkoutCalendarRoute } from './get-monthly-workout-calendar.route'
import { getWeeklyWorkoutCalendarRoute } from './get-weekly-workout-calendar.route'
import { getWorkoutCalendarRoute } from './get-workout-calendar.route'
import { getWorkoutSessionDetailsRoute } from './get-workout-session-details.route'
import { getWorkoutSessionsByWorkoutRoute } from './get-workout-sessions-by-workout.route'
import { getWorkoutSessionsHistoryRoute } from './get-workout-sessions-history.route'
import { startExerciseTimerRoute } from './start-exercise-timer.route'
import { startWorkoutSessionRoute } from './start-workout-session.route'
import { stopExerciseTimerRoute } from './stop-exercise-timer.route'

export function sessionsRoutes(app: FastifyInstance) {
  app.register(getDailyWorkoutSessionRoute)
  app.register(getWorkoutSessionDetailsRoute)
  app.register(getWeeklyWorkoutCalendarRoute)
  app.register(getMonthlyWorkoutCalendarRoute)
  app.register(getWorkoutCalendarRoute)
  app.register(getWorkoutSessionsHistoryRoute)
  app.register(createExerciseLogSessionRoute)
  app.register(completeWorkoutSessionRoute)
  app.register(compareWorkoutSessionsRoute)
  app.register(compareWorkoutExercisesRoute)
  app.register(getWorkoutSessionsByWorkoutRoute)
  app.register(compareWorkoutsRoute)
  app.register(compareWeeklyWorkoutsRoute)
  app.register(compareMonthlyWorkoutsRoute)
  app.register(startWorkoutSessionRoute)
  app.register(finishWorkoutSessionRoute)
  app.register(startExerciseTimerRoute)
  app.register(stopExerciseTimerRoute)
  app.register(getExerciseSessionDetailsRoute)
  app.register(completeExerciseSessionRoute)
  app.register(getExerciseSessionProgressRoute)
}
