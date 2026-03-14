import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { GetWeightSummaryUseCase } from '../get-weight-summary.use-case'

export function makeGetWeightSummaryUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const getWeightSummaryUseCase = new GetWeightSummaryUseCase(
    weightLogsRepository
  )

  return getWeightSummaryUseCase
}
