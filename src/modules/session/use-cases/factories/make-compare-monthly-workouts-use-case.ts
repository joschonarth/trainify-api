import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareMonthlyWorkoutsUseCase } from '../compare-monthly-workouts.use-case'

export function makeCompareMonthlyWorkoutsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const compareMonthlyWorkoutsUseCase = new CompareMonthlyWorkoutsUseCase(
    workoutSessionsRepository,
    usersRepository
  )

  return compareMonthlyWorkoutsUseCase
}
