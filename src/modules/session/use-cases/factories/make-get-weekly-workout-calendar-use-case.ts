import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'
import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { GetWeeklyWorkoutCalendarUseCase } from '../get-weekly-workout-calendar.use-case'

export function makeGetWeeklyWorkoutCalendarUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const getWeeklyWorkoutCalendarUseCase = new GetWeeklyWorkoutCalendarUseCase(
    workoutSessionsRepository,
    usersRepository
  )

  return getWeeklyWorkoutCalendarUseCase
}
