import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises.repository'

import { DeleteCustomExerciseUseCase } from '../delete-custom-exercise.use-case'

export function makeDeleteCustomExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  return new DeleteCustomExerciseUseCase(exercisesRepository)
}
