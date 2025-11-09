import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'

import { GetExerciseProgressUseCase } from '../get-exercise-progress.use-case'

export function makeGetExerciseProgressUseCase() {
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const getExerciseProgressUseCase = new GetExerciseProgressUseCase(
    exerciseLogsRepository,
  )

  return getExerciseProgressUseCase
}
