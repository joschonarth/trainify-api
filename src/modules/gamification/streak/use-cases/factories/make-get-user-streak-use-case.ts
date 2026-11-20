import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaStreakPlansRepository } from '../../repositories/prisma/prisma-streak-plans.repository'
import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'

import { GetUserStreakUseCase } from '../get-user-streak.use-case'

export function makeGetUserStreakUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const streakPlansRepository = new PrismaStreakPlansRepository()
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const getUserStreakUseCase = new GetUserStreakUseCase(
    usersRepository,
    streakPlansRepository,
    userStreakLogsRepository
  )

  return getUserStreakUseCase
}
