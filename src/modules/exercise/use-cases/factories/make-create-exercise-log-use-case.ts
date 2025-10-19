import { PrismaExerciseLogsRepository } from '@/modules/exercise/repositories/prisma/prisma-exercise-logs.repository'

import { CreateExerciseLogUseCase } from '../create-exercise-log.use-case'

export function makeCreateExerciseLogUseCase() {
  const exerciseLogsRepository = new PrismaExerciseLogsRepository()
  const useCase = new CreateExerciseLogUseCase(exerciseLogsRepository)

  return useCase
}
