import type { Badge } from 'generated/prisma'

import type { BadgesRepository } from '@/modules/gamification/repositories/badges.repository'
import type { UserStreaksRepository } from '@/modules/gamification/repositories/user-streaks.repository'

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

    const { currentStreak } = userStreak

    const userBadges = await this.badgesRepository.findByUser(userId)

    const streakBadges = await this.badgesRepository.findAllByType('STREAK')

    const newBadges = []

    for (const badge of streakBadges) {
      const alreadyHas = userBadges.some((ub) => ub.badgeId === badge.id)

      if (!alreadyHas && badge.milestone && currentStreak >= badge.milestone) {
        await this.badgesRepository.unlockForUser(userId, badge.id)
        newBadges.push(badge)
      }
    }

    return { badges: newBadges }
  }
}
