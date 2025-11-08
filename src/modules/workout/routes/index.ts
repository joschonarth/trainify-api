import { FastifyInstance } from 'fastify'

import { addExerciseToWorkoutController } from '@/modules/workout/controllers/add-exercise-to-workout.controller'
import { assignDaysToWorkoutController } from '@/modules/workout/controllers/assign-days-to-workout.controller'
import { createWorkoutController } from '@/modules/workout/controllers/create-workout.controller'
import { deleteWorkoutController } from '@/modules/workout/controllers/delete-workout.controller'
import { fetchUserWorkoutsController } from '@/modules/workout/controllers/fetch-user-workouts.controller'
import { fetchWorkoutExercisesController } from '@/modules/workout/controllers/fetch-workout-exercises.controller'
import { fetchWorkoutSchedulesController } from '@/modules/workout/controllers/fetch-workout-schedules.controller'
import { getWorkoutDetailsController } from '@/modules/workout/controllers/get-workout-details'
import { removeExerciseFromWorkoutController } from '@/modules/workout/controllers/remove-exercise-from-workout.controller'
import { removeWorkoutScheduleDayController } from '@/modules/workout/controllers/remove-workout-schedule-day.controller'
import { updateWorkoutController } from '@/modules/workout/controllers/update-workout.controller'
import { updateWorkoutExerciseDefaultsController } from '@/modules/workout/controllers/update-workout-exercise-defaults.controller'
import { updateWorkoutScheduleDayController } from '@/modules/workout/controllers/update-workout-schedule-day.controller'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { createOrAttachExerciseToWorkoutController } from '../controllers/create-or-attach-exercise-to-workout.controller'

export async function workoutsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  // --- WORKOUTS ---
  app.get('/workouts', fetchUserWorkoutsController)
  app.get('/workouts/:workoutId', getWorkoutDetailsController)
  app.post('/workouts', createWorkoutController)
  app.put('/workouts/:workoutId', updateWorkoutController)
  app.delete('/workouts/:workoutId', deleteWorkoutController)

  // --- EXERCISES ---
  app.get('/workouts/:workoutId/exercises', fetchWorkoutExercisesController)

  app.post('/workouts/:workoutId/exercises', addExerciseToWorkoutController)
  app.post(
    '/workouts/:workoutId/exercises/create-or-attach',
    createOrAttachExerciseToWorkoutController,
  )
  app.put(
    '/workouts/:workoutId/exercises/:exerciseId',
    updateWorkoutExerciseDefaultsController,
  )
  app.delete(
    '/workouts/:workoutId/exercises/:exerciseId',
    removeExerciseFromWorkoutController,
  )

  // --- SCHEDULES ---
  app.get('/workouts/:workoutId/schedules', fetchWorkoutSchedulesController)
  app.post('/workouts/:workoutId/schedules', assignDaysToWorkoutController)
  app.put(
    '/workouts/:workoutId/schedules/:scheduleId',
    updateWorkoutScheduleDayController,
  )
  app.delete(
    '/workouts/:workoutId/schedules/:scheduleId',
    removeWorkoutScheduleDayController,
  )
}
