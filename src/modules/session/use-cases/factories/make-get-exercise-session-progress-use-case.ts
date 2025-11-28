import { PrismaExerciseSessionsRepository } from '@/modules/session/repositories/prisma/prisma-exercise-sessions.repository'

import { GetExerciseSessionProgressUseCase } from '../get-exercise-session-progress.use-case'

export function makeGetExerciseSessionProgressUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const getExerciseSessionProgressUseCase =
    new GetExerciseSessionProgressUseCase(exerciseSessionsRepository)

  return getExerciseSessionProgressUseCase
}
