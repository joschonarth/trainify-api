import { BadgeType } from '@prisma/client'

import { BadgesRepository } from '@/repositories/badges.repository'

interface GetBadgesStatsUseCaseRequest {
  userId: string
}

interface GetBadgesStatsUseCaseResponse {
  overall: {
    total: number
    unlocked: number
    progress: number
  }
  byType: Record<
    BadgeType,
    {
      total: number
      unlocked: number
      progress: number
    }
  >
}

export class GetBadgesStatsUseCase {
  constructor(private badgesRepository: BadgesRepository) {}

  async execute({
    userId,
  }: GetBadgesStatsUseCaseRequest): Promise<GetBadgesStatsUseCaseResponse> {
    const allBadges = await this.badgesRepository.findAll()
    const userBadges = await this.badgesRepository.findByUser(userId)
    const unlockedIds = userBadges.map((ub) => ub.badgeId)

    const total = allBadges.length
    const unlocked = allBadges.filter((b) => unlockedIds.includes(b.id)).length
    const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0

    const byType = Object.values(BadgeType).reduce(
      (acc, type) => {
        const badgesOfType = allBadges.filter((b) => b.type === type)
        const unlockedOfType = badgesOfType.filter((b) =>
          unlockedIds.includes(b.id),
        ).length

        acc[type] = {
          total: badgesOfType.length,
          unlocked: unlockedOfType,
          progress:
            badgesOfType.length > 0
              ? Math.round((unlockedOfType / badgesOfType.length) * 100)
              : 0,
        }

        return acc
      },
      {} as Record<
        BadgeType,
        { total: number; unlocked: number; progress: number }
      >,
    )

    return {
      overall: {
        total,
        unlocked,
        progress,
      },
      byType,
    }
  }
}
