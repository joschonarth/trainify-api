import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { CreateWeightGoalUseCase } from '../create-weight-goal.use-case'

export function makeCreateWeightGoalUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const createWeightGoalUseCase = new CreateWeightGoalUseCase(weightUnitOfWork)

  return createWeightGoalUseCase
}
