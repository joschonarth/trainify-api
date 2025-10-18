import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { DeactivateWeightGoalUseCase } from '../deactivate-weight-goal.use-case'

export function makeDeactivateWeightGoalUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const deactivateWeightGoalUseCase = new DeactivateWeightGoalUseCase(
    weightGoalsRepository,
  )

  return deactivateWeightGoalUseCase
}
