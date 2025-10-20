import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'

import { FetchExercisesCatalogUseCase } from '../fetch-exercises-catalog.use-case'

export function makeFetchExercisesCatalogUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const fetchExercisesCatalogUseCase = new FetchExercisesCatalogUseCase(
    exercisesRepository,
  )

  return fetchExercisesCatalogUseCase
}
