import { PrismaBadgesRepository } from '@/repositories/prisma/prisma-badges.repository'
import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { UnlockWorkoutBadgesUseCase } from '../unlock-workout-badges.use-case'

export function makeUnlockWorkoutBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const workoutSessionRepository = new PrismaWorkoutSessionsRepository()

  const userStreakUseCase = new UnlockWorkoutBadgesUseCase(
    badgesRepository,
    workoutSessionRepository,
  )

  return userStreakUseCase
}
