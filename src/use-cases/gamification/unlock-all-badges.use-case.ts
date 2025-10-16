import { Badge } from '@prisma/client'

import { UnlockWorkoutBadgesUseCase } from './unlock-workout-badges.use-case'

interface UnlockAllBadgesRequest {
  userId: string
}

interface UnlockAllBadgesResponse {
  badges: Badge[]
}

export class UnlockAllBadgesUseCase {
  constructor(private unlockWorkoutBadgesUseCase: UnlockWorkoutBadgesUseCase) {}

  async execute({
    userId,
  }: UnlockAllBadgesRequest): Promise<UnlockAllBadgesResponse> {
    const unlockedBadges: Badge[] = []

    const workoutBadges = await this.unlockWorkoutBadgesUseCase.execute({
      userId,
    })
    unlockedBadges.push(...workoutBadges.badges)

    return { badges: unlockedBadges }
  }
}
