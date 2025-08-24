import { FastifyInstance } from 'fastify'

import { addExerciseFromCatalogController } from '@/controllers/add-exercise-from-catalog.controller'
import { createExerciseController } from '@/controllers/create-exercise.controller'
import { deleteCustomExerciseController } from '@/controllers/delete-custom-exercise.controller'
import { fetchExercisesCatalogController } from '@/controllers/fetch-exercises-catalog.controller'
import { fetchMyExercisesController } from '@/controllers/fetch-my-exercises.controller'
import { getExerciseDetailsController } from '@/controllers/get-exercise-details.controller'
import { updateExerciseController } from '@/controllers/update-exercise.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function exercisesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/exercises/:id', getExerciseDetailsController)
  app.get('/exercises/my', fetchMyExercisesController)
  app.post('/exercises/my', createExerciseController)
  app.put('/exercises/my/:id', updateExerciseController)
  app.delete('/exercises/my/custom/:exerciseId', deleteCustomExerciseController)
  app.get('/exercises/catalog', fetchExercisesCatalogController)
  app.post(
    '/exercises/catalog/:id/add',
    { onRequest: [verifyJwt] },
    addExerciseFromCatalogController,
  )
}
