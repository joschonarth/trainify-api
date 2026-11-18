import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareWeeklyWorkoutsUseCase } from '../compare-weekly-workouts.use-case'

export function makeCompareWeeklyWorkoutsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const compareWeeklyWorkoutsUseCase = new CompareWeeklyWorkoutsUseCase(
    workoutSessionsRepository,
    usersRepository
  )

  return compareWeeklyWorkoutsUseCase
}
