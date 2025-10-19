import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { RemoveCatalogExerciseUseCase } from '../remove-catalog-exercise.use-case'

export function makeRemoveCatalogExerciseUseCase() {
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const useCase = new RemoveCatalogExerciseUseCase(myExercisesRepository)

  return useCase
}
