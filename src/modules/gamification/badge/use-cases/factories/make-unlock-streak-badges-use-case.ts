import type { Prisma } from 'generated/prisma'
import { PrismaBadgesRepository } from '@/modules/gamification/badge/repositories/prisma/prisma-badges.repository'
import { PrismaUserStreaksRepository } from '@/modules/gamification/streak/repositories/prisma/prisma-user-streaks.repository'

import { UnlockStreakBadgesUseCase } from '../unlock-streak-badges.use-case'

export function makeUnlockStreakBadgesUseCase(
  transaction?: Prisma.TransactionClient
) {
  const badgesRepository = new PrismaBadgesRepository(transaction)
  const userStreaksRepository = new PrismaUserStreaksRepository(transaction)

  const unlockStreakBadgesUseCase = new UnlockStreakBadgesUseCase(
    badgesRepository,
    userStreaksRepository
  )

  return unlockStreakBadgesUseCase
}
