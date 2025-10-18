import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { DeleteWeightGoalUseCase } from '../delete-weight-goal.use-case'

export function makeDeleteWeightGoalUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()

  const deleteWeightGoalUseCase = new DeleteWeightGoalUseCase(
    weightGoalsRepository,
    weightLogsRepository,
  )

  return deleteWeightGoalUseCase
}
