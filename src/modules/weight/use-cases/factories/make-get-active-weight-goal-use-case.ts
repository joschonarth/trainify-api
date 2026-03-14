import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { GetActiveWeightGoalUseCase } from '../get-active-weight-goal.use-case'

export function makeGetActiveWeightGoalUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()

  const getActiveWeightGoalUseCase = new GetActiveWeightGoalUseCase(
    weightGoalsRepository
  )

  return getActiveWeightGoalUseCase
}
