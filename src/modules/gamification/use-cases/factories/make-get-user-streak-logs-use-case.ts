import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'
import { GetUserStreakLogsUseCase } from '../get-user-streak-logs.use-case'

export function makeGetUserStreakLogsUseCase() {
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const getUserStreakLogsUseCase = new GetUserStreakLogsUseCase(
    userStreakLogsRepository,
  )

  return getUserStreakLogsUseCase
}
