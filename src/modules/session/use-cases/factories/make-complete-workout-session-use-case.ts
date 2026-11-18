import { makeUnlockAllBadgesUseCase } from '@/modules/gamification/use-cases/factories/make-unlock-all-badges-use-case'
import { makeUpdateUserStreakUseCase } from '@/modules/gamification/use-cases/factories/make-update-user-streak-use-case'
import { PrismaSessionCompletionUnitOfWork } from '@/modules/session/repositories/prisma/prisma-session-completion-unit-of-work'

import { CompleteWorkoutSessionUseCase } from '../complete-workout-session.use-case'

export function makeCompleteWorkoutSessionUseCase() {
  const sessionCompletionUnitOfWork = new PrismaSessionCompletionUnitOfWork()
  const updateUserStreakUseCase = makeUpdateUserStreakUseCase()
  const unlockAllBadgesUseCase = makeUnlockAllBadgesUseCase()

  const completeWorkoutSessionUseCase = new CompleteWorkoutSessionUseCase(
    sessionCompletionUnitOfWork,
    updateUserStreakUseCase,
    unlockAllBadgesUseCase
  )

  return completeWorkoutSessionUseCase
}
