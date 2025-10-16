import { Badge } from '@prisma/client'

import { BadgesRepository } from '@/repositories/badges.repository'

interface GetAllBadgesUseCaseResponse {
  badges: Badge[]
}

export class GetAllBadgesUseCase {
  constructor(private badgesRepository: BadgesRepository) {}

  async execute(): Promise<GetAllBadgesUseCaseResponse> {
    const badges = await this.badgesRepository.findAll()

    return { badges }
  }
}
