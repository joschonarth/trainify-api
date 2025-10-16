import { PrismaBadgesRepository } from '@/repositories/prisma/prisma-badges.repository'
import { PrismaUserStreaksRepository } from '@/repositories/prisma/prisma-user-streaks.repository'

import { UnlockStreakBadgesUseCase } from '../unlock-streak-badges.use-case'

export function makeUnlockStreakBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const userStreaksRepository = new PrismaUserStreaksRepository()

  const unlockStreakBadgesUseCase = new UnlockStreakBadgesUseCase(
    badgesRepository,
    userStreaksRepository,
  )

  return unlockStreakBadgesUseCase
}
