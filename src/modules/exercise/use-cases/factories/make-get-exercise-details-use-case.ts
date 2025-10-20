import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'

import { GetExerciseDetailsUseCase } from '../get-exercise-details.use-case'

export function makeGetExerciseDetailsUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const getExerciseDetailsUseCase = new GetExerciseDetailsUseCase(
    exercisesRepository,
  )

  return getExerciseDetailsUseCase
}
