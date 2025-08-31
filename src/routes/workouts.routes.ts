import { FastifyInstance } from 'fastify'

import { addExerciseToWorkoutController } from '@/controllers/workouts/add-exercise-to-workout.controller'
import { assignDaysToWorkoutController } from '@/controllers/workouts/assign-days-to-workout.controller'
import { createWorkoutController } from '@/controllers/workouts/create-workout.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function workoutsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.post('/workouts', createWorkoutController)
  app.post('/workouts/:workoutId/exercises', addExerciseToWorkoutController)
  app.post('/workouts/:workoutId/schedules', assignDaysToWorkoutController)
}
