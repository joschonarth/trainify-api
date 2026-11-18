import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'
import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { GetWorkoutCalendarUseCase } from '../get-workout-calendar.use-case'

export function makeGetWorkoutCalendarUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const getWorkoutCalendarUseCase = new GetWorkoutCalendarUseCase(
    workoutSessionsRepository,
    usersRepository
  )

  return getWorkoutCalendarUseCase
}
