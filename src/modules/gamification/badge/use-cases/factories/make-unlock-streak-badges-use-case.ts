import { PrismaBadgesRepository } from '@/modules/gamification/badge/repositories/prisma/prisma-badges.repository'
import { PrismaUserStreaksRepository } from '@/modules/gamification/streak/repositories/prisma/prisma-user-streaks.repository'

import { UnlockStreakBadgesUseCase } from '../unlock-streak-badges.use-case'

export function makeUnlockStreakBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const userStreaksRepository = new PrismaUserStreaksRepository()

  const unlockStreakBadgesUseCase = new UnlockStreakBadgesUseCase(
    badgesRepository,
    userStreaksRepository
  )

  return unlockStreakBadgesUseCase
}
