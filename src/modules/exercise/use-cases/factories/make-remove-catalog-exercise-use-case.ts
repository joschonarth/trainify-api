import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'
import { PrismaWorkoutsRepository } from '@/modules/workout/repositories/prisma/prisma-workouts.repository'

import { RemoveCatalogExerciseUseCase } from '../remove-catalog-exercise.use-case'

export function makeRemoveCatalogExerciseUseCase() {
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const removeCatalogExerciseUseCase = new RemoveCatalogExerciseUseCase(
    myExercisesRepository,
    workoutsRepository
  )

  return removeCatalogExerciseUseCase
}
