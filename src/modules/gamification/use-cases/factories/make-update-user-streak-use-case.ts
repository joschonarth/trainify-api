import { PrismaUserStreaksRepository } from '@/modules/gamification/repositories/prisma/prisma-user-streaks.repository'

import { UpdateUserStreakUseCase } from '../update-user-streak.use-case'

export function makeUpdateUserStreakUseCase() {
  const userStreaksRepository = new PrismaUserStreaksRepository()
  const updateUserStreakUseCase = new UpdateUserStreakUseCase(
    userStreaksRepository,
  )

  return updateUserStreakUseCase
}
