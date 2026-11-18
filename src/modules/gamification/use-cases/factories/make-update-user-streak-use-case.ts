import { PrismaUserStreaksRepository } from '@/modules/gamification/repositories/prisma/prisma-user-streaks.repository'
import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'
import { UpdateUserStreakUseCase } from '../update-user-streak.use-case'

export function makeUpdateUserStreakUseCase() {
  const userStreaksRepository = new PrismaUserStreaksRepository()
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const usersRepository = new PrismaUsersRepository()
  const updateUserStreakUseCase = new UpdateUserStreakUseCase(
    userStreaksRepository,
    userStreakLogsRepository,
    usersRepository
  )

  return updateUserStreakUseCase
}
