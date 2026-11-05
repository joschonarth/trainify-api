import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'
import { makeGetExerciseDetailsUseCase } from '@/modules/exercise/use-cases/factories/make-get-exercise-details-use-case'

import { GetExerciseProgressUseCase } from '../get-exercise-progress.use-case'

export function makeGetExerciseProgressUseCase() {
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const getExerciseDetailsUseCase = makeGetExerciseDetailsUseCase()
  const getExerciseProgressUseCase = new GetExerciseProgressUseCase(
    exerciseLogsRepository,
    getExerciseDetailsUseCase
  )

  return getExerciseProgressUseCase
}
