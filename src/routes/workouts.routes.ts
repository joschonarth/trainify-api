import { FastifyInstance } from 'fastify'

import { createWorkoutController } from '@/controllers/workouts/create-workout.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function workoutsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.post('/workouts', createWorkoutController)
}
