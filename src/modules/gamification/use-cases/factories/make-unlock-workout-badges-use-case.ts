import { PrismaBadgesRepository } from '@/modules/gamification/repositories/prisma/prisma-badges.repository'
import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { UnlockWorkoutBadgesUseCase } from '../unlock-workout-badges.use-case'

export function makeUnlockWorkoutBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const workoutSessionRepository = new PrismaWorkoutSessionsRepository()

  const unlockWorkoutBadgesUseCase = new UnlockWorkoutBadgesUseCase(
    badgesRepository,
    workoutSessionRepository,
  )

  return unlockWorkoutBadgesUseCase
}
