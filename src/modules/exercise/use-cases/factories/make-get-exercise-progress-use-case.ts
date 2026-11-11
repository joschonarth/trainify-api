import { makeGetExerciseDetailsUseCase } from '@/modules/exercise/use-cases/factories/make-get-exercise-details-use-case'
import { PrismaExerciseSessionsRepository } from '@/modules/session/repositories/prisma/prisma-exercise-sessions.repository'

import { GetExerciseProgressUseCase } from '../get-exercise-progress.use-case'

export function makeGetExerciseProgressUseCase() {
  const exerciseSessionsRepository = new PrismaExerciseSessionsRepository()
  const getExerciseDetailsUseCase = makeGetExerciseDetailsUseCase()
  const getExerciseProgressUseCase = new GetExerciseProgressUseCase(
    exerciseSessionsRepository,
    getExerciseDetailsUseCase
  )

  return getExerciseProgressUseCase
}
