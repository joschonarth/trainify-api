import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'

import { FetchExerciseLogsUseCase } from '../fetch-exercise-logs.use-case'

export function makeFetchExerciseLogsUseCase() {
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const fetchExerciseLogsUseCase = new FetchExerciseLogsUseCase(
    exerciseLogsRepository,
  )

  return fetchExerciseLogsUseCase
}
