import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises.repository'

import { UpdateExerciseUseCase } from '../update-exercise.use-case'

export function makeUpdateExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  return new UpdateExerciseUseCase(exercisesRepository)
}
