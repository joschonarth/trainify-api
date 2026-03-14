import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareWeeklyWorkoutsUseCase } from '../compare-weekly-workouts.use-case'

export function makeCompareWeeklyWorkoutsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const compareWeeklyWorkoutsUseCase = new CompareWeeklyWorkoutsUseCase(
    workoutSessionsRepository
  )

  return compareWeeklyWorkoutsUseCase
}
