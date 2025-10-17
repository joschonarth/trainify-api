import { PrismaBadgesRepository } from '@/modules/gamification/repositories/prisma/prisma-badges.repository'
import { PrismaExerciseLogsRepository } from '@/repositories/prisma/prisma-exercise-logs.repository'

import { UnlockExerciseBadgesUseCase } from '../unlock-exercise-badges.use-case'

export function makeUnlockExerciseBadgesUseCase() {
  const badgesRepository = new PrismaBadgesRepository()
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()

  const unlockExerciseBadgesUseCase = new UnlockExerciseBadgesUseCase(
    badgesRepository,
    exerciseLogsRepository,
  )

  return unlockExerciseBadgesUseCase
}
