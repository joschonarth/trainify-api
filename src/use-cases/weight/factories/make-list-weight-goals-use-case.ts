import { PrismaWeightGoalsRepository } from '@/repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '@/repositories/prisma/prisma-weight-logs.repository'

import { ListWeightGoalsUseCase } from '../list-weight-goals.use-case'

export function makeListWeightGoalsUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const listWeightGoalsUseCase = new ListWeightGoalsUseCase(
    weightGoalsRepository,
    weightLogsRepository,
  )

  return listWeightGoalsUseCase
}
