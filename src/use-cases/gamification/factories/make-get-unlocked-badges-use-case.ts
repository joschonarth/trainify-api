import { PrismaBadgesRepository } from '@/repositories/prisma/prisma-badges.repository'

import { GetUnlockedBadgesUseCase } from '../get-unlocked-badges.use-case'

export function makeGetUnlockedBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const getUnlockedBadgesUseCase = new GetUnlockedBadgesUseCase(
    badgesRepository,
  )

  return getUnlockedBadgesUseCase
}
