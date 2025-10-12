import { PrismaWeightGoalsRepository } from '@/repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '@/repositories/prisma/prisma-weight-logs.repository'

import { AchieveWeightGoalUseCase } from '../achieve-weight-goal.use-case'

export function makeAchieveWeightGoalUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const achieveWeightGoalUseCase = new AchieveWeightGoalUseCase(
    weightGoalsRepository,
    weightLogsRepository,
  )

  return achieveWeightGoalUseCase
}
