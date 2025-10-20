import { PrismaExercisesRepository } from '@/modules/exercise/repositories/prisma/prisma-exercises.repository'

import { UpdateExerciseUseCase } from '../update-exercise.use-case'

export function makeUpdateExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const updateExerciseUseCase = new UpdateExerciseUseCase(exercisesRepository)

  return updateExerciseUseCase
}
