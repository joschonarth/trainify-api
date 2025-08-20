import { FastifyInstance } from 'fastify'

import { createExercise } from '@/controllers/create-exercise.controller'
import { fetchExercisesCatalog } from '@/controllers/fetch-exercises-catalog.controller'
import { getExerciseDetails } from '@/controllers/get-exercise-details.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function exercisesRoutes(app: FastifyInstance) {
  app.post('/exercises/my', { onRequest: [verifyJwt] }, createExercise)
  app.get('/exercises/:id', { onRequest: [verifyJwt] }, getExerciseDetails)
  app.get('/exercises/catalog', fetchExercisesCatalog)
}
