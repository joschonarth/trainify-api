import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { GetActiveWeightGoalAnalyticsUseCase } from '../get-active-weight-goal-analytics.use-case'

export function makeGetActiveWeightGoalAnalyticsUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const getActiveWeightGoalAnalyticsUseCase =
    new GetActiveWeightGoalAnalyticsUseCase(
      weightLogsRepository,
      weightGoalsRepository,
    )

  return getActiveWeightGoalAnalyticsUseCase
}
