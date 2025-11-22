import { PrismaExerciseSessionsRepository } from '@/modules/session/repositories/prisma/prisma-exercise-sessions.repository'

import { GetExerciseSessionDetailsUseCase } from '../get-exercise-session-details.use-case'

export function makeGetExerciseSessionDetailsUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const getExerciseSessionDetailsUseCase = new GetExerciseSessionDetailsUseCase(
    exerciseSessionsRepository,
  )

  return getExerciseSessionDetailsUseCase
}
