import type { Badge } from 'generated/prisma'

import type { BadgesRepository } from '@/modules/gamification/badge/repositories/badges.repository'
import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'

interface UnlockWorkoutBadgesRequest {
  userId: string
}

interface UnlockWorkoutBadgesResponse {
  badges: Badge[]
}

export class UnlockWorkoutBadgesUseCase {
  constructor(
    private readonly badgesRepository: BadgesRepository,
    private readonly workoutSessionRepository: Pick<
      WorkoutSessionsRepository,
      'countCompletedByUser'
    >
  ) {}

  async execute({
    userId,
  }: UnlockWorkoutBadgesRequest): Promise<UnlockWorkoutBadgesResponse> {
    const completedWorkouts =
      await this.workoutSessionRepository.countCompletedByUser(userId)

    const userBadges = await this.badgesRepository.findByUser(userId)

    const workoutBadges = await this.badgesRepository.findAllByType('WORKOUT')

    const newBadges: Badge[] = []

    for (const badge of workoutBadges) {
      const alreadyHas = userBadges.some((ub) => ub.badgeId === badge.id)

      if (
        !alreadyHas &&
        badge.milestone &&
        completedWorkouts >= badge.milestone
      ) {
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
