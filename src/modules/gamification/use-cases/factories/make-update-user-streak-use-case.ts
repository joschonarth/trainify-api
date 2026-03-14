import { PrismaUserStreaksRepository } from '@/modules/gamification/repositories/prisma/prisma-user-streaks.repository'

import { PrismaUserStreakLogsRepository } from '../../repositories/prisma/prisma-user-streak-logs.repository'
import { UpdateUserStreakUseCase } from '../update-user-streak.use-case'

export function makeUpdateUserStreakUseCase() {
  const userStreaksRepository = new PrismaUserStreaksRepository()
  const userStreakLogsRepository = new PrismaUserStreakLogsRepository()
  const updateUserStreakUseCase = new UpdateUserStreakUseCase(
    userStreaksRepository,
    userStreakLogsRepository
  )

  return updateUserStreakUseCase
}
