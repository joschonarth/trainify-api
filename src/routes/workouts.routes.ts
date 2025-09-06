import { FastifyInstance } from 'fastify'

import { addExerciseToWorkoutController } from '@/controllers/workouts/add-exercise-to-workout.controller'
import { assignDaysToWorkoutController } from '@/controllers/workouts/assign-days-to-workout.controller'
import { createWorkoutController } from '@/controllers/workouts/create-workout.controller'
import { deleteWorkoutController } from '@/controllers/workouts/delete-workout.controller'
import { fetchUserWorkoutsController } from '@/controllers/workouts/fetch-user-workouts.controller'
import { fetchWorkoutExercisesController } from '@/controllers/workouts/fetch-workout-exercises.controller'
import { fetchWorkoutSchedulesController } from '@/controllers/workouts/fetch-workout-schedules.controller'
import { getWorkoutDetailsController } from '@/controllers/workouts/get-workout-details'
import { removeExerciseFromWorkoutController } from '@/controllers/workouts/remove-exercise-from-workout.controller'
import { removeWorkoutScheduleDayController } from '@/controllers/workouts/remove-workout-schedule-day.controller'
import { updateWorkoutController } from '@/controllers/workouts/update-workout.controller'
import { updateWorkoutExerciseDefaultsController } from '@/controllers/workouts/update-workout-exercise-defaults.controller'
import { updateWorkoutScheduleDayController } from '@/controllers/workouts/update-workout-schedule-day.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function workoutsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/workouts', fetchUserWorkoutsController)
  app.get('/workouts/:workoutId', getWorkoutDetailsController)
  app.get('/workouts/:workoutId/exercises', fetchWorkoutExercisesController)
  app.get('/workouts/:workoutId/schedules', fetchWorkoutSchedulesController)

  app.post('/workouts', createWorkoutController)
  app.post('/workouts/:workoutId/exercises', addExerciseToWorkoutController)
  app.post('/workouts/:workoutId/schedules', assignDaysToWorkoutController)

  app.put('/workouts/:workoutId', updateWorkoutController)
  app.put(
    '/workouts/:workoutId/exercises/:exerciseId',
    updateWorkoutExerciseDefaultsController,
  )
  app.put(
    '/workouts/:workoutId/schedules/:scheduleId',
    updateWorkoutScheduleDayController,
  )

  app.delete('/workouts/:workoutId', deleteWorkoutController)
  app.delete(
    '/workouts/:workoutId/exercises/:exerciseId',
    removeExerciseFromWorkoutController,
  )
  app.delete(
    '/workouts/:workoutId/schedules/:scheduleId',
    removeWorkoutScheduleDayController,
  )
}
