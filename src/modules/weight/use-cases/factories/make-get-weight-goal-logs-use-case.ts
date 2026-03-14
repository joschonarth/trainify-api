import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { GetWeightGoalLogsUseCase } from '../get-weight-goal-logs.use-case'

export function makeGetWeightGoalLogsUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const getWeightGoalLogsUseCase = new GetWeightGoalLogsUseCase(
    weightGoalsRepository,
    weightLogsRepository
  )

  return getWeightGoalLogsUseCase
}
