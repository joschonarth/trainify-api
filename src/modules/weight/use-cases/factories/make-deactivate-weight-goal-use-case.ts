import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { DeactivateWeightGoalUseCase } from '../deactivate-weight-goal.use-case'

export function makeDeactivateWeightGoalUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const deactivateWeightGoalUseCase = new DeactivateWeightGoalUseCase(
    weightUnitOfWork
  )

  return deactivateWeightGoalUseCase
}
