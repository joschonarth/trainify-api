import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { UpdateWeightGoalUseCase } from '../update-weight-goal.use-case'

export function makeUpdateWeightGoalUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()

  const updateWeightGoalUseCase = new UpdateWeightGoalUseCase(weightUnitOfWork)

  return updateWeightGoalUseCase
}
