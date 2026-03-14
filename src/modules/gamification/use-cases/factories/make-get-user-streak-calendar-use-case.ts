import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'
import { GetUserStreakCalendarUseCase } from '../get-user-streak-calendar.use-case'

export function makeGetUserStreakCalendarUseCase() {
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const getUserStreakCalendarUseCase = new GetUserStreakCalendarUseCase(
    userStreakLogsRepository
  )

  return getUserStreakCalendarUseCase
}
