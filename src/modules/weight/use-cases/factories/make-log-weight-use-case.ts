import { PrismaWeightGoalsRepository } from '@/modules/weight/repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '@/modules/weight/repositories/prisma/prisma-weight-logs.repository'

import { AchieveWeightGoalUseCase } from '../achieve-weight-goal.use-case'
import { LogWeightUseCase } from '../log-weight.use-case'

export function makeLogWeightUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const weightGoalsRepository = new PrismaWeightGoalsRepository()

  const achieveWeightGoalUseCase = new AchieveWeightGoalUseCase(
    weightGoalsRepository,
    weightLogsRepository,
  )

  const logWeightUseCase = new LogWeightUseCase(
    weightLogsRepository,
    weightGoalsRepository,
    achieveWeightGoalUseCase,
  )

  return logWeightUseCase
}
