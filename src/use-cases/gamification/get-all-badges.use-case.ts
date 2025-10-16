import { Badge, BadgeType } from '@prisma/client'

import { BadgesRepository } from '@/repositories/badges.repository'

interface GetAllBadgesUseCaseRequest {
  userId: string
  type?: BadgeType
  unlocked?: boolean
}

interface BadgeWithStatus extends Badge {
  unlocked: boolean
}

interface GetAllBadgesUseCaseResponse {
  badges: BadgeWithStatus[]
}

export class GetAllBadgesUseCase {
  constructor(private badgesRepository: BadgesRepository) {}

  async execute({
    userId,
    type,
    unlocked,
  }: GetAllBadgesUseCaseRequest): Promise<GetAllBadgesUseCaseResponse> {
    const allBadges = type
      ? await this.badgesRepository.findAllByType(type)
      : await this.badgesRepository.findAll()

    const userBadges = await this.badgesRepository.findByUser(userId)
    const unlockedIds = userBadges.map((ub) => ub.badgeId)

    let badgesWithStatus: BadgeWithStatus[] = allBadges.map((b) => ({
      ...b,
      unlocked: unlockedIds.includes(b.id),
    }))

    if (unlocked !== undefined) {
      badgesWithStatus = badgesWithStatus.filter((b) => b.unlocked === unlocked)
    }

    badgesWithStatus.sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1
      if (!a.unlocked && b.unlocked) return 1
      return 0
    })

    return { badges: badgesWithStatus }
  }
}
