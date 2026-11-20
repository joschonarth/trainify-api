import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaStreakPlansRepository } from '../../repositories/prisma/prisma-streak-plans.repository'
import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'
import { GetUserStreakCalendarUseCase } from '../get-user-streak-calendar.use-case'

export function makeGetUserStreakCalendarUseCase() {
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const usersRepository = new PrismaUsersRepository()
  const streakPlansRepository = new PrismaStreakPlansRepository()
  const getUserStreakCalendarUseCase = new GetUserStreakCalendarUseCase(
    userStreakLogsRepository,
    usersRepository,
    streakPlansRepository
  )

  return getUserStreakCalendarUseCase
}
