import type { Prisma } from 'generated/prisma'
import { PrismaBadgesRepository } from '@/modules/gamification/badge/repositories/prisma/prisma-badges.repository'
import { PrismaExerciseSessionsRepository } from '@/modules/session/repositories/prisma/prisma-exercise-sessions.repository'

import { UnlockExerciseBadgesUseCase } from '../unlock-exercise-badges.use-case'

export function makeUnlockExerciseBadgesUseCase(
  transaction?: Prisma.TransactionClient
) {
  const badgesRepository = new PrismaBadgesRepository(transaction)
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository(
    transaction
  )

  const unlockExerciseBadgesUseCase = new UnlockExerciseBadgesUseCase(
    badgesRepository,
    exerciseSessionsRepository
  )

  return unlockExerciseBadgesUseCase
}
