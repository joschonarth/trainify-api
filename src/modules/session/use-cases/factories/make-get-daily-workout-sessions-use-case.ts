import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'
import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaWorkoutSchedulesRepository } from '@/modules/workout/repositories/prisma/prisma-workout-schedules.repository'

import { GetDailyWorkoutSessionUseCase } from '../get-daily-workout-session.use-case'

export function makeGetDailyWorkoutSessionUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const workoutSchedulesRepository = new PrismaWorkoutSchedulesRepository()
  const usersRepository = new PrismaUsersRepository()
  const getDailyWorkoutSessionUseCase = new GetDailyWorkoutSessionUseCase(
    workoutSessionsRepository,
    workoutSchedulesRepository,
    usersRepository
  )

  return getDailyWorkoutSessionUseCase
}
