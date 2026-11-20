import type { Badge } from 'generated/prisma'

import type { BadgesRepository } from '@/modules/gamification/badge/repositories/badges.repository'

interface BadgeWithUnlockedAt extends Badge {
  unlockedAt: Date
}

interface GetUnlockedBadgesUseCaseRequest {
  userId: string
}

interface GetUnlockedBadgesUseCaseResponse {
  badges: BadgeWithUnlockedAt[]
}

export class GetUnlockedBadgesUseCase {
  constructor(
    private readonly badgesRepository: Pick<BadgesRepository, 'findByUser'>
  ) {}

  async execute({
    userId,
  }: GetUnlockedBadgesUseCaseRequest): Promise<GetUnlockedBadgesUseCaseResponse> {
    const userBadges = await this.badgesRepository.findByUser(userId)

    const badges = userBadges.map(({ badge, unlockedAt }) => ({
      ...badge,
      unlockedAt,
    }))

    const sortedBadges = badges.sort(
      (a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime()
    )

    return { badges: sortedBadges }
  }
}
