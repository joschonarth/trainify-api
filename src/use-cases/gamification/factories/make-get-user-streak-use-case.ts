import { PrismaUserStreaksRepository } from '@/repositories/prisma/prisma-user-streaks.repository'

import { GetUserStreakUseCase } from '../get-user-streak.use-case'

export function makeGetUserStreakUseCase() {
  const userStreaksRepository = new PrismaUserStreaksRepository()
  const getUserStreakUseCase = new GetUserStreakUseCase(userStreaksRepository)

  return getUserStreakUseCase
}
