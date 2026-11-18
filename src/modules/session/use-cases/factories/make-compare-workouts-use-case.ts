import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { CompareWorkoutsUseCase } from '../compare-workouts.use-case'

export function makeCompareWorkoutsUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const compareWorkoutsUseCase = new CompareWorkoutsUseCase(
    workoutSessionsRepository,
    usersRepository
  )

  return compareWorkoutsUseCase
}
