import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'
import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { GetMonthlyWorkoutCalendarUseCase } from '../get-monthly-workout-calendar.use-case'

export function makeGetMonthlyWorkoutCalendarUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const getMonthlyWorkoutCalendarUseCase = new GetMonthlyWorkoutCalendarUseCase(
    workoutSessionsRepository,
    usersRepository
  )

  return getMonthlyWorkoutCalendarUseCase
}
