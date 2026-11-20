import type { Badge } from 'generated/prisma'

import type { BadgesRepository } from '@/modules/gamification/badge/repositories/badges.repository'
import type { UserStreaksRepository } from '@/modules/gamification/streak/repositories/user-streaks.repository'

interface UnlockStreakBadgesRequest {
  userId: string
}

interface UnlockStreakBadgesResponse {
  badges: Badge[]
}

export class UnlockStreakBadgesUseCase {
  constructor(
    private readonly badgesRepository: BadgesRepository,
    private readonly userStreaksRepository: UserStreaksRepository
  ) {}

  async execute({
    userId,
  }: UnlockStreakBadgesRequest): Promise<UnlockStreakBadgesResponse> {
    const userStreak = await this.userStreaksRepository.findByUserId(userId)

    if (!userStreak) {
      return { badges: [] }
    }

    const { bestStreak } = userStreak

    const userBadges = await this.badgesRepository.findByUser(userId)

    const streakBadges = await this.badgesRepository.findAllByType('STREAK')

    const newBadges: Badge[] = []

    for (const badge of streakBadges) {
      const alreadyHas = userBadges.some((ub) => ub.badgeId === badge.id)

      if (!alreadyHas && badge.milestone && bestStreak >= badge.milestone) {
        const created = await this.badgesRepository.unlockForUser(
          userId,
          badge.id
        )
        if (created) {
          newBadges.push(badge)
        }
      }
    }

    return { badges: newBadges }
  }
}
