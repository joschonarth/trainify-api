import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareMonthlyWorkoutsUseCase } from '../compare-monthly-workouts.use-case'

export function makeCompareMonthlyWorkoutsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const compareMonthlyWorkoutsUseCase = new CompareMonthlyWorkoutsUseCase(
    workoutSessionsRepository
  )

  return compareMonthlyWorkoutsUseCase
}
