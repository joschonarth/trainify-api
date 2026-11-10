import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'
import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'
import { PrismaWorkoutsRepository } from '@/modules/workout/repositories/prisma/prisma-workouts.repository'

import { DeleteCustomExerciseUseCase } from '../delete-custom-exercise.use-case'
import { RemoveCatalogExerciseUseCase } from '../remove-catalog-exercise.use-case'
import { RemoveExerciseFromLibraryUseCase } from '../remove-exercise-from-library.use-case'

export function makeRemoveExerciseFromLibraryUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const deleteCustomExerciseUseCase = new DeleteCustomExerciseUseCase(
    exercisesRepository,
    myExercisesRepository
  )
  const removeCatalogExerciseUseCase = new RemoveCatalogExerciseUseCase(
    myExercisesRepository,
    workoutsRepository
  )
  const removeExerciseFromLibraryUseCase = new RemoveExerciseFromLibraryUseCase(
    exercisesRepository,
    deleteCustomExerciseUseCase,
    removeCatalogExerciseUseCase
  )

  return removeExerciseFromLibraryUseCase
}
