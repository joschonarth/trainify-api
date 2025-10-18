import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { GetWeightLogUseCase } from '../get-weight-log.use-case'

export function makeGetWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const getWeightLogUseCase = new GetWeightLogUseCase(weightLogsRepository)

  return getWeightLogUseCase
}
