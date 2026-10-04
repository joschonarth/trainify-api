import { PrismaExerciseSessionsRepository } from '../../repositories/prisma/prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompleteExerciseSessionUseCase } from '../complete-exercise-session.use-case'

export function makeCompleteExerciseSessionUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()

  const useCase = new CompleteExerciseSessionUseCase(
    exerciseSessionsRepository,
    workoutSessionsRepository
  )

  return useCase
}
