import { FastifyInstance } from 'fastify'

import { addExerciseFromCatalogController } from '@/controllers/exercises/add-exercise-from-catalog.controller'
import { createExerciseController } from '@/controllers/exercises/create-exercise.controller'
import { deleteCustomExerciseController } from '@/controllers/exercises/delete-custom-exercise.controller'
import { fetchExercisesCatalogController } from '@/controllers/exercises/fetch-exercises-catalog.controller'
import { fetchMyExercisesController } from '@/controllers/exercises/fetch-my-exercises.controller'
import { getExerciseDetailsController } from '@/controllers/exercises/get-exercise-details.controller'
import { removeCatalogExerciseController } from '@/controllers/exercises/remove-catalog-exercise.controller'
import { updateExerciseController } from '@/controllers/exercises/update-exercise.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function exercisesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/exercises/:id', getExerciseDetailsController)
  app.get('/exercises/my', fetchMyExercisesController)
  app.get('/exercises/catalog', fetchExercisesCatalogController)

  app.post('/exercises/my', createExerciseController)
  app.post(
    '/exercises/catalog/:id/add',
    { onRequest: [verifyJwt] },
    addExerciseFromCatalogController,
  )

  app.put('/exercises/:exerciseId', updateExerciseController)

  app.delete('/exercises/my/custom/:exerciseId', deleteCustomExerciseController)
  app.delete('/exercises/my/catalog/:id', removeCatalogExerciseController)
}
