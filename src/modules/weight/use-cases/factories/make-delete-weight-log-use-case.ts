import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { DeleteWeightLogUseCase } from '../delete-weight-log.use-case'

export function makeDeleteWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const deleteWeightLogUseCase = new DeleteWeightLogUseCase(
    weightLogsRepository,
  )

  return deleteWeightLogUseCase
}
