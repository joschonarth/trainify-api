import { PrismaWeightGoalsRepository } from '@/modules/weight/repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '@/modules/weight/repositories/prisma/prisma-weight-logs.repository'

import { GetWeightSummaryUseCase } from '../get-weight-summary.use-case'

export function makeGetWeightSummaryUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const getWeightSummaryUseCase = new GetWeightSummaryUseCase(
    weightGoalsRepository,
    weightLogsRepository,
  )

  return getWeightSummaryUseCase
}
