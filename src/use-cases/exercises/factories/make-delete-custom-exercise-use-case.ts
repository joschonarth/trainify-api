import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises.repository'

import { DeleteCustomExerciseUseCase } from '../delete-custom-exercise.use-case'

export function makeDeleteCustomExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const useCase = new DeleteCustomExerciseUseCase(exercisesRepository)

  return useCase
}
