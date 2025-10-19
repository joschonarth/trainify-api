import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'

import { FetchExerciseLogsUseCase } from '../../../modules/exercise/use-cases/fetch-exercise-logs.use-case'

export function makeFetchExerciseLogsUseCase() {
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const useCase = new FetchExerciseLogsUseCase(exerciseLogsRepository)

  return useCase
}
