import { PrismaWeightLogsRepository } from '@/repositories/prisma/prisma-weight-logs.repository'

import { LogWeightUseCase } from '../log-weight.use-case'

export function makeLogWeightUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const logWeightUseCase = new LogWeightUseCase(weightLogsRepository)

  return logWeightUseCase
}
