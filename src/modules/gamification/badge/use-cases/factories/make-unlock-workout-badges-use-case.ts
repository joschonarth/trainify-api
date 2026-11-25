import type { Prisma } from 'generated/prisma'
import { PrismaBadgesRepository } from '@/modules/gamification/badge/repositories/prisma/prisma-badges.repository'
import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { UnlockWorkoutBadgesUseCase } from '../unlock-workout-badges.use-case'

export function makeUnlockWorkoutBadgesUseCase(
  transaction?: Prisma.TransactionClient
) {
  const badgesRepository = new PrismaBadgesRepository(transaction)
  const workoutSessionRepository = new PrismaWorkoutSessionsRepository(
    transaction
  )

  const unlockWorkoutBadgesUseCase = new UnlockWorkoutBadgesUseCase(
    badgesRepository,
    workoutSessionRepository
  )

  return unlockWorkoutBadgesUseCase
}
