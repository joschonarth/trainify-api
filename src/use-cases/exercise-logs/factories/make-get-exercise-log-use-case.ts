import { PrismaExerciseLogsRepository } from '@/repositories/prisma/prisma-exercise-logs.repository'

import { GetExerciseLogUseCase } from '../get-exercise-log.use-case'

export function makeGetExerciseLogUseCase() {
  const repo = new PrismaExerciseLogsRepository()
  return new GetExerciseLogUseCase(repo)
}
