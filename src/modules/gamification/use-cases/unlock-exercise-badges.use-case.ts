import { Badge } from '@prisma/client'

import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'
import { BadgesRepository } from '@/modules/gamification/repositories/badges.repository'

interface UnlockExerciseBadgesRequest {
  userId: string
}

interface UnlockExerciseBadgesResponse {
  badges: Badge[]
}

export class UnlockExerciseBadgesUseCase {
  constructor(
    private badgesRepository: BadgesRepository,
    private exerciseLogsRepository: PrismaExerciseLogsRepository,
  ) {}

  async execute({
    userId,
  }: UnlockExerciseBadgesRequest): Promise<UnlockExerciseBadgesResponse> {
    const completedExercises =
      await this.exerciseLogsRepository.countCompletedByUser(userId)

    const userBadges = await this.badgesRepository.findByUser(userId)

    const exerciseBadges = await this.badgesRepository.findAllByType('EXERCISE')

    const newBadges = []

    for (const badge of exerciseBadges) {
      const alreadyHas = userBadges.some((ub) => ub.badgeId === badge.id)

      if (
        !alreadyHas &&
        badge.milestone &&
        completedExercises >= badge.milestone
      ) {
        await this.badgesRepository.unlockForUser(userId, badge.id)
        newBadges.push(badge)
      }
    }

    return { badges: newBadges }
  }
}
