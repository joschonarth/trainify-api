import type { FastifyInstance } from 'fastify'

import { addExerciseToWorkoutRoute } from './add-exercise-to-workout.route'
import { assignDaysToWorkoutRoute } from './assign-days-to-workout.route'
import { createOrAttachExerciseToWorkoutRoute } from './create-or-attach-exercise-to-workout.route'
import { createWorkoutRoute } from './create-workout.route'
import { deleteWorkoutRoute } from './delete-workout.route'
import { fetchUserWorkoutsRoute } from './fetch-user-workouts.route'
import { fetchWorkoutExercisesRoute } from './fetch-workout-exercises.route'
import { fetchWorkoutSchedulesRoute } from './fetch-workout-schedules.route'
import { getWorkoutDetailsRoute } from './get-workout-details.route'
import { getWorkoutStatsRoute } from './get-workout-stats.route'
import { removeExerciseFromWorkoutRoute } from './remove-exercise-from-workout.route'
import { removeWorkoutScheduleDayRoute } from './remove-workout-schedule-day.route'
import { updateWorkoutRoute } from './update-workout.route'
import { updateWorkoutExerciseDefaultsRoute } from './update-workout-exercise-defaults.route'
import { updateWorkoutScheduleDayRoute } from './update-workout-schedule-day.route'

export function workoutsRoutes(app: FastifyInstance) {
  app.register(fetchUserWorkoutsRoute)
  app.register(getWorkoutDetailsRoute)
  app.register(createWorkoutRoute)
  app.register(updateWorkoutRoute)
  app.register(deleteWorkoutRoute)
  app.register(getWorkoutStatsRoute)
  app.register(fetchWorkoutExercisesRoute)
  app.register(addExerciseToWorkoutRoute)
  app.register(createOrAttachExerciseToWorkoutRoute)
  app.register(updateWorkoutExerciseDefaultsRoute)
  app.register(removeExerciseFromWorkoutRoute)
  app.register(fetchWorkoutSchedulesRoute)
  app.register(assignDaysToWorkoutRoute)
  app.register(updateWorkoutScheduleDayRoute)
  app.register(removeWorkoutScheduleDayRoute)
}
