import { FastifyInstance } from 'fastify'

import { addExerciseFromCatalog } from '@/controllers/add-exercise-from-catalog.controller'
import { createExercise } from '@/controllers/create-exercise.controller'
import { fetchExercisesCatalog } from '@/controllers/fetch-exercises-catalog.controller'
import { getExerciseDetails } from '@/controllers/get-exercise-details.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function exercisesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.post('/exercises/my', createExercise)
  app.get('/exercises/:id', getExerciseDetails)
  app.get('/exercises/catalog', fetchExercisesCatalog)
  app.post(
    '/exercises/catalog/:id/add',
    { onRequest: [verifyJwt] },
    addExerciseFromCatalog,
  )
}
