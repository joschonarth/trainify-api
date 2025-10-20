import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'

import { DeleteCustomExerciseUseCase } from '../delete-custom-exercise.use-case'

export function makeDeleteCustomExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const deleteCustomExerciseUseCase = new DeleteCustomExerciseUseCase(
    exercisesRepository,
  )

  return deleteCustomExerciseUseCase
}
