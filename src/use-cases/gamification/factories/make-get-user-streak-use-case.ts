import { PrismaUserStreaksRepository } from '@/repositories/prisma/prisma-user-streaks.repository'

import { GetUserStreakUseCase } from '../get-user-streak.use-case'

export function makeGetUserStreakUseCase() {
  const userStreaksRepository = new PrismaUserStreaksRepository()
  const userStreakUseCase = new GetUserStreakUseCase(userStreaksRepository)

  return userStreakUseCase
}
