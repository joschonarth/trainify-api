import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'
import { PrismaMyExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-my-exercises.repository'

import { CreateExerciseUseCase } from '../create-exercise.use-case'

export function makeCreateExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const myExercisesRepository = new PrismaMyExercisesRepository()
  const useCase = new CreateExerciseUseCase(
    exercisesRepository,
    myExercisesRepository,
  )

  return useCase
}
