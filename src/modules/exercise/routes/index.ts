import type { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { addExerciseFromCatalogController } from '../controllers/add-exercise-from-catalog.controller'
import { createExerciseController } from '../controllers/create-exercise.controller'
import { createExerciseLogController } from '../controllers/create-exercise-log.controller'
import { deleteCustomExerciseController } from '../controllers/delete-custom-exercise.controller'
import { fetchExerciseLogsController } from '../controllers/fetch-exercise-logs.controller'
import { fetchExercisesCatalogController } from '../controllers/fetch-exercises-catalog.controller'
import { fetchMyExercisesController } from '../controllers/fetch-my-exercises.controller'
import { fetchUserExercisesController } from '../controllers/fetch-user-exercises.controller'
import { getExerciseDetailsController } from '../controllers/get-exercise-details.controller'
import { getExerciseLogController } from '../controllers/get-exercise-log.controller'
import { getExerciseProgressController } from '../controllers/get-exercise-progress.controller'
import { removeCatalogExerciseController } from '../controllers/remove-catalog-exercise.controller'
import { updateExerciseController } from '../controllers/update-exercise.controller'

export async function exercisesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/exercises', fetchUserExercisesController)
  app.get('/exercises/:id', getExerciseDetailsController)
  app.get('/exercises/my', fetchMyExercisesController)
  app.get('/exercises/catalog', fetchExercisesCatalogController)

  app.post('/exercises/my', createExerciseController)
  app.post(
    '/exercises/catalog/:id/add',
    { onRequest: [verifyJwt] },
    addExerciseFromCatalogController
  )

  app.put('/exercises/:exerciseId', updateExerciseController)

  app.delete('/exercises/my/custom/:exerciseId', deleteCustomExerciseController)
  app.delete('/exercises/my/catalog/:id', removeCatalogExerciseController)

  /** Exercise Logs */
  app.get('/exercise-logs', fetchExerciseLogsController)
  app.get('/exercise-logs/:id', getExerciseLogController)

  app.post('/exercise-logs', createExerciseLogController)

  /** Exercise Progress */
  app.get('/exercises/:exerciseId/progress', getExerciseProgressController)
}
