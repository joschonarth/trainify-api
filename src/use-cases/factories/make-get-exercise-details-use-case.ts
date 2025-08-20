import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises.repository'

import { GetExerciseDetailsUseCase } from '../get-exercise-details'

export function makeGetExerciseDetailsUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const useCase = new GetExerciseDetailsUseCase(exercisesRepository)

  return useCase
}
