import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises.repository'

import { FetchExercisesCatalogUseCase } from '../fetch-exercises-catalog'

export function makeFetchExercisesCatalogUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const useCase = new FetchExercisesCatalogUseCase(exercisesRepository)

  return useCase
}
