import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { UpdateWeightLogUseCase } from '../update-weight-log.use-case'
import { makeAchieveWeightGoalUseCase } from './make-achieve-weight-goal-use-case'

export function makeUpdateWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const achieveWeightGoalUseCase = makeAchieveWeightGoalUseCase()

  const updateWeightLogUseCase = new UpdateWeightLogUseCase(
    weightLogsRepository,
    weightGoalsRepository,
    achieveWeightGoalUseCase,
  )

  return updateWeightLogUseCase
}
