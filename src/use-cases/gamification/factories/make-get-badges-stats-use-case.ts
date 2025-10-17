import { PrismaBadgesRepository } from '@/repositories/prisma/prisma-badges.repository'

import { GetBadgesStatsUseCase } from '../get-badges-stats.use-case'

export function makeGetBadgesStatsUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const getBadgesStatsUseCase = new GetBadgesStatsUseCase(badgesRepository)

  return getBadgesStatsUseCase
}
