import type { FastifyInstance } from 'fastify'

import { addExerciseFromCatalogRoute } from './add-exercise-from-catalog.route'
import { createExerciseRoute } from './create-exercise.route'
import { createExerciseLogRoute } from './create-exercise-log.route'
import { deleteCustomExerciseRoute } from './delete-custom-exercise.route'
import { fetchExerciseLogsRoute } from './fetch-exercise-logs.route'
import { fetchExercisesCatalogRoute } from './fetch-exercises-catalog.route'
import { fetchMyExercisesRoute } from './fetch-my-exercises.route'
import { fetchUserExercisesRoute } from './fetch-user-exercises.route'
import { getExerciseDetailsRoute } from './get-exercise-details.route'
import { getExerciseLogRoute } from './get-exercise-log.route'
import { getExerciseProgressRoute } from './get-exercise-progress.route'
import { removeCatalogExerciseRoute } from './remove-catalog-exercise.route'
import { updateExerciseRoute } from './update-exercise.route'

export function exercisesRoutes(app: FastifyInstance) {
  app.register(fetchUserExercisesRoute)
  app.register(getExerciseDetailsRoute)
  app.register(fetchMyExercisesRoute)
  app.register(fetchExercisesCatalogRoute)
  app.register(createExerciseRoute)
  app.register(addExerciseFromCatalogRoute)
  app.register(updateExerciseRoute)
  app.register(deleteCustomExerciseRoute)
  app.register(removeCatalogExerciseRoute)
  app.register(fetchExerciseLogsRoute)
  app.register(getExerciseLogRoute)
  app.register(createExerciseLogRoute)
  app.register(getExerciseProgressRoute)
}
