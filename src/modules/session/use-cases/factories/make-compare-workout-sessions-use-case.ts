import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareWorkoutSessionsUseCase } from '../compare-workout-sessions'

export function makeCompareWorkoutSessionsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const compareWorkoutSessionsUseCase = new CompareWorkoutSessionsUseCase(
    workoutSessionsRepository
  )

  return compareWorkoutSessionsUseCase
}
