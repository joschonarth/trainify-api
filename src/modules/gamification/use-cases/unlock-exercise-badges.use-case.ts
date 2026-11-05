import type { Badge } from 'generated/prisma'
import type { BadgesRepository } from '@/modules/gamification/repositories/badges.repository'
import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'

interface UnlockExerciseBadgesRequest {
  userId: string
}

interface UnlockExerciseBadgesResponse {
  badges: Badge[]
}

export class UnlockExerciseBadgesUseCase {
  constructor(
    private readonly badgesRepository: Pick<
      BadgesRepository,
      'findByUser' | 'findAllByType' | 'unlockForUser'
    >,
    private readonly exerciseSessionsRepository: Pick<
      ExerciseSessionsRepository,
      'countCompletedByUser'
    >
  ) {}

  async execute({
    userId,
  }: UnlockExerciseBadgesRequest): Promise<UnlockExerciseBadgesResponse> {
    const completedExercises =
      await this.exerciseSessionsRepository.countCompletedByUser(userId)

    const userBadges = await this.badgesRepository.findByUser(userId)

    const exerciseBadges = await this.badgesRepository.findAllByType('EXERCISE')

    const newBadges: Badge[] = []

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
