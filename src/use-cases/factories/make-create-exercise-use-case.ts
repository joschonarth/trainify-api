import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises.repository'

import { CreateExerciseUseCase } from '../create-exercise'

export function makeCreateExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const useCase = new CreateExerciseUseCase(exercisesRepository)

  return useCase
}
