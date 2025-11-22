import { PrismaExerciseSessionsRepository } from '../../repositories/prisma/prisma-exercise-sessions.repository'
import { CompleteExerciseSessionUseCase } from '../complete-exercise-session.use-case'

export function makeCompleteExerciseSessionUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()

  const useCase = new CompleteExerciseSessionUseCase(exerciseSessionsRepository)

  return useCase
}
