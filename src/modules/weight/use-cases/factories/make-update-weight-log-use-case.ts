import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { UpdateWeightLogUseCase } from '../update-weight-log.use-case'

export function makeUpdateWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const updateWeightLogUseCase = new UpdateWeightLogUseCase(
    weightLogsRepository,
  )

  return updateWeightLogUseCase
}
