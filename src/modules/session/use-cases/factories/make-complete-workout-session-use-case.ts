import { PrismaSessionCompletionUnitOfWork } from '@/modules/session/repositories/prisma/prisma-session-completion-unit-of-work'

import { CompleteWorkoutSessionUseCase } from '../complete-workout-session.use-case'

export function makeCompleteWorkoutSessionUseCase() {
  return new CompleteWorkoutSessionUseCase(
    new PrismaSessionCompletionUnitOfWork()
  )
}
