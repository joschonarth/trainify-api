import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'
import { PrismaUserStreaksRepository } from '../../repositories/prisma/prisma-user-streaks.repository'
import { RefreshUserStreakUseCase } from '../refresh-user-streak.use-case'

export function makeRefreshUserStreakUseCase() {
  const userStreaksRepository = new PrismaUserStreaksRepository()
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const usersRepository = new PrismaUsersRepository()
  const refreshUserStreakUseCase = new RefreshUserStreakUseCase(
    userStreaksRepository,
    userStreakLogsRepository,
    usersRepository
  )
  return refreshUserStreakUseCase
}
