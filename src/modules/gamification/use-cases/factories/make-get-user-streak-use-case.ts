import { PrismaUserStreaksRepository } from '@/modules/gamification/repositories/prisma/prisma-user-streaks.repository'

import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { GetUserStreakUseCase } from '../get-user-streak.use-case'

export function makeGetUserStreakUseCase() {
  const userStreaksRepository = new PrismaUserStreaksRepository()
  const usersRepository = new PrismaUsersRepository()
  const getUserStreakUseCase = new GetUserStreakUseCase(
    userStreaksRepository,
    usersRepository
  )

  return getUserStreakUseCase
}
