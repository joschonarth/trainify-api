import type { Badge, BadgeType } from 'generated/prisma'

import type { BadgesRepository } from '@/modules/gamification/repositories/badges.repository'

interface GetAllBadgesUseCaseRequest {
  userId: string
  type?: BadgeType
  unlocked?: boolean
}

interface BadgeWithStatus extends Badge {
  unlocked: boolean
  unlockedAt?: Date | undefined
}

interface GetAllBadgesUseCaseResponse {
  badges: BadgeWithStatus[]
}

export class GetAllBadgesUseCase {
  constructor(private readonly badgesRepository: BadgesRepository) {}

  async execute({
    userId,
    type,
    unlocked,
  }: GetAllBadgesUseCaseRequest): Promise<GetAllBadgesUseCaseResponse> {
    const allBadges = type
      ? await this.badgesRepository.findAllByType(type)
      : await this.badgesRepository.findAll()

    const userBadges = await this.badgesRepository.findByUser(userId)
    const userBadgesMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]))

    let badgesWithStatus: BadgeWithStatus[] = allBadges.map((b) => {
      const userBadge = userBadgesMap.get(b.id)
      return {
        ...b,
        unlocked: !!userBadge,
        unlockedAt: userBadge?.unlockedAt,
      }
    })

    if (unlocked !== undefined) {
      badgesWithStatus = badgesWithStatus.filter((b) => b.unlocked === unlocked)
    }

    badgesWithStatus.sort((a, b) => {
      if (a.unlocked && !b.unlocked) {
        return -1
      }
      if (!a.unlocked && b.unlocked) {
        return 1
      }
      return 0
    })

    return { badges: badgesWithStatus }
  }
}
