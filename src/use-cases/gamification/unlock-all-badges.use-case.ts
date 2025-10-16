import { Badge } from '@prisma/client'

import { UnlockExerciseBadgesUseCase } from './unlock-exercise-badges.use-case'
import { UnlockStreakBadgesUseCase } from './unlock-streak-badges.use-case'
import { UnlockWorkoutBadgesUseCase } from './unlock-workout-badges.use-case'

interface UnlockAllBadgesRequest {
  userId: string
}

interface UnlockAllBadgesResponse {
  badges: Badge[]
}

export class UnlockAllBadgesUseCase {
  constructor(
    private unlockWorkoutBadgesUseCase: UnlockWorkoutBadgesUseCase,
    private unlockExerciseBadgesUseCase: UnlockExerciseBadgesUseCase,
    private unlockStreakBadgesUseCase: UnlockStreakBadgesUseCase,
  ) {}

  async execute({
    userId,
  }: UnlockAllBadgesRequest): Promise<UnlockAllBadgesResponse> {
    const unlockedBadges: Badge[] = []

    const workoutBadges = await this.unlockWorkoutBadgesUseCase.execute({
      userId,
    })
    unlockedBadges.push(...workoutBadges.badges)

    const exerciseBadges = await this.unlockExerciseBadgesUseCase.execute({
      userId,
    })
    unlockedBadges.push(...exerciseBadges.badges)

    const streakBadges = await this.unlockStreakBadgesUseCase.execute({
      userId,
    })
    unlockedBadges.push(...streakBadges.badges)

    return { badges: unlockedBadges }
  }
}
