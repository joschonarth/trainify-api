import { PrismaWeightLogsRepository } from '@/repositories/prisma/prisma-weight-logs.repository'
import { GetGeneralWeightAnalyticsUseCase } from '@/use-cases/weight/get-general-weight-analytics.use-case'

export function makeGetGeneralWeightAnalyticsUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const getGeneralWeightAnalyticsUseCase = new GetGeneralWeightAnalyticsUseCase(
    weightLogsRepository,
  )

  return getGeneralWeightAnalyticsUseCase
}
