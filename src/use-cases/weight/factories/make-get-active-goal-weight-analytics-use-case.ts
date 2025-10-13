import { PrismaWeightGoalsRepository } from '@/repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '@/repositories/prisma/prisma-weight-logs.repository'

import { GetActiveGoalWeightAnalyticsUseCase } from '../get-active-goal-weight-analytics.use-case'

export function makeGetActiveGoalWeightAnalyticsUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const getActiveGoalWeightAnalyticsUseCase =
    new GetActiveGoalWeightAnalyticsUseCase(
      weightLogsRepository,
      weightGoalsRepository,
    )

  return getActiveGoalWeightAnalyticsUseCase
}
