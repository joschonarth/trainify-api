import { PrismaWeightGoalsRepository } from '@/modules/weight/repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '@/modules/weight/repositories/prisma/prisma-weight-logs.repository'

import { UpdateWeightGoalUseCase } from '../update-weight-goal.use-case'

export function makeUpdateWeightGoalUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const updateWeightGoalUseCase = new UpdateWeightGoalUseCase(
    weightGoalsRepository,
    weightLogsRepository,
  )

  return updateWeightGoalUseCase
}
