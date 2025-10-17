import { Badge } from '@prisma/client'

import { BadgesRepository } from '@/modules/gamification/repositories/badges.repository'

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
  constructor(private badgesRepository: BadgesRepository) {}

  async execute({
    userId,
  }: GetUnlockedBadgesUseCaseRequest): Promise<GetUnlockedBadgesUseCaseResponse> {
    const userBadges = await this.badgesRepository.findByUser(userId)

    const badges = await Promise.all(
      userBadges.map(async (userBadge) => {
        const badge = await this.badgesRepository.findById(userBadge.badgeId)
        return {
          ...badge!,
          unlockedAt: userBadge.unlockedAt,
        }
      }),
    )

    const sortedBadges = badges.sort(
      (a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime(),
    )

    return { badges: sortedBadges }
  }
}
