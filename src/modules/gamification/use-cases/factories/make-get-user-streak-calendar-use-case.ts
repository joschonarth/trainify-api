import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'
import { GetUserStreakCalendarUseCase } from '../get-user-streak-calendar.use-case'

export function makeGetUserStreakCalendarUseCase() {
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const usersRepository = new PrismaUsersRepository()
  const getUserStreakCalendarUseCase = new GetUserStreakCalendarUseCase(
    userStreakLogsRepository,
    usersRepository
  )

  return getUserStreakCalendarUseCase
}
