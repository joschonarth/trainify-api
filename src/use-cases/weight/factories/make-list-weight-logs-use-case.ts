import { PrismaWeightLogsRepository } from '@/repositories/prisma/prisma-weight-logs.repository'

import { ListWeightLogsUseCase } from '../list-weight-logs.use-case'

export function makeListWeightLogsUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const listWeightLogsUseCase = new ListWeightLogsUseCase(weightLogsRepository)

  return listWeightLogsUseCase
}
