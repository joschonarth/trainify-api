import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'
import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { DeleteCustomExerciseUseCase } from '../delete-custom-exercise.use-case'

export function makeDeleteCustomExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const deleteCustomExerciseUseCase = new DeleteCustomExerciseUseCase(
    exercisesRepository,
    myExercisesRepository
  )

  return deleteCustomExerciseUseCase
}
