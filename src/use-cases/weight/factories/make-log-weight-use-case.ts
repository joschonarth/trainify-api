import { PrismaWeightGoalsRepository } from '@/repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '@/repositories/prisma/prisma-weight-logs.repository'

import { LogWeightUseCase } from '../log-weight.use-case'

export function makeLogWeightUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const weightGoalsRepository = new PrismaWeightGoalsRepository()

  const logWeightUseCase = new LogWeightUseCase(
    weightLogsRepository,
    weightGoalsRepository,
  )

  return logWeightUseCase
}
