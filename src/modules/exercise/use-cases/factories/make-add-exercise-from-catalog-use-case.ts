import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'
import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { AddExerciseFromCatalogUseCase } from '../add-exercise-from-catalog.use-case'

export function makeAddExerciseFromCatalog() {
  const exercisesRepository = new PrismaExercisesRepository()
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const useCase = new AddExerciseFromCatalogUseCase(
    exercisesRepository,
    myExercisesRepository,
  )

  return useCase
}
