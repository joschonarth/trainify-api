import { PrismaBadgesRepository } from '@/repositories/prisma/prisma-badges.repository'

import { GetAllBadgesUseCase } from '../get-all-badges.use-case'

export function makeGetAllBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const getAllBadgesUseCase = new GetAllBadgesUseCase(badgesRepository)

  return getAllBadgesUseCase
}
