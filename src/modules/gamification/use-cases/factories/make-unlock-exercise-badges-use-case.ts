import { PrismaBadgesRepository } from '@/modules/gamification/repositories/prisma/prisma-badges.repository'
import { PrismaExerciseSessionsRepository } from '@/modules/session/repositories/prisma/prisma-exercise-sessions.repository'

import { UnlockExerciseBadgesUseCase } from '../unlock-exercise-badges.use-case'

export function makeUnlockExerciseBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()

  const unlockExerciseBadgesUseCase = new UnlockExerciseBadgesUseCase(
    badgesRepository,
    exerciseSessionsRepository
  )

  return unlockExerciseBadgesUseCase
}
