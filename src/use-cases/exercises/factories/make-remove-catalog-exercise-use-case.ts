import { PrismaMyExercisesRepository } from '@/repositories/prisma/prisma-my-exercises.repository'

import { RemoveCatalogExerciseUseCase } from '../remove-catalog-exercise.use-case'

export function makeRemoveCatalogExerciseUseCase() {
  const myExercisesRepository = new PrismaMyExercisesRepository()
  return new RemoveCatalogExerciseUseCase(myExercisesRepository)
}
