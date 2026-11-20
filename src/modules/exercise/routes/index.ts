import type { FastifyInstance } from 'fastify'
import { addExerciseFromCatalogRoute } from './add-exercise-from-catalog.route'
import { createExerciseRoute } from './create-exercise.route'
import { fetchExerciseLogsRoute } from './fetch-exercise-logs.route'
import { fetchExercisesCatalogRoute } from './fetch-exercises-catalog.route'
import { fetchMyExercisesRoute } from './fetch-my-exercises.route'
import { getExerciseDetailsRoute } from './get-exercise-details.route'
import { getExerciseLogRoute } from './get-exercise-log.route'
import { getExerciseProgressRoute } from './get-exercise-progress.route'
import { removeExerciseFromLibraryRoute } from './remove-exercise-from-library.route'
import { setExerciseFavoriteRoute } from './set-exercise-favorite.route'
import { updateExerciseRoute } from './update-exercise.route'

export function exercisesRoutes(app: FastifyInstance) {
  app.register(getExerciseDetailsRoute)
  app.register(setExerciseFavoriteRoute)
  app.register(fetchMyExercisesRoute)
  app.register(fetchExercisesCatalogRoute)
  app.register(createExerciseRoute)
  app.register(addExerciseFromCatalogRoute)
  app.register(updateExerciseRoute)
  app.register(removeExerciseFromLibraryRoute)
  app.register(fetchExerciseLogsRoute)
  app.register(getExerciseLogRoute)
  app.register(getExerciseProgressRoute)
}
