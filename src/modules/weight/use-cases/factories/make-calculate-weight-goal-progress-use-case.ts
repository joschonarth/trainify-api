import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { CalculateWeightGoalProgressUseCase } from '../calculate-weight-goal-progress.use-case'
import { makeAchieveWeightGoalUseCase } from './make-achieve-weight-goal-use-case'

export function makeCalculateWeightGoalProgressUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const achieveWeightGoalUseCase = makeAchieveWeightGoalUseCase()

  const calculateWeightGoalProgressUseCase =
    new CalculateWeightGoalProgressUseCase(
      weightGoalsRepository,
      weightLogsRepository,
      achieveWeightGoalUseCase,
    )

  return calculateWeightGoalProgressUseCase
}
