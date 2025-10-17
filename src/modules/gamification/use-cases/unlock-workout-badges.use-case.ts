import { Badge } from '@prisma/client'

import { BadgesRepository } from '@/modules/gamification/repositories/badges.repository'
import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

interface UnlockWorkoutBadgesRequest {
  userId: string
}

interface UnlockWorkoutBadgesResponse {
  badges: Badge[]
}

export class UnlockWorkoutBadgesUseCase {
  constructor(
    private badgesRepository: BadgesRepository,
    private workoutSessionRepository: PrismaWorkoutSessionsRepository,
  ) {}

  async execute({
    userId,
  }: UnlockWorkoutBadgesRequest): Promise<UnlockWorkoutBadgesResponse> {
    const completedWorkouts =
      await this.workoutSessionRepository.countCompletedByUser(userId)

    const userBadges = await this.badgesRepository.findByUser(userId)

    const workoutBadges = await this.badgesRepository.findAllByType('WORKOUT')

    const newBadges = []

    for (const badge of workoutBadges) {
      const alreadyHas = userBadges.some((ub) => ub.badgeId === badge.id)

      if (
        !alreadyHas &&
        badge.milestone &&
        completedWorkouts >= badge.milestone
      ) {
        await this.badgesRepository.unlockForUser(userId, badge.id)
        newBadges.push(badge)
      }
    }

    return { badges: newBadges }
  }
}
