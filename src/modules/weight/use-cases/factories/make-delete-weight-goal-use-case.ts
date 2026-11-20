import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { DeleteWeightGoalUseCase } from '../delete-weight-goal.use-case'

export function makeDeleteWeightGoalUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const deleteWeightGoalUseCase = new DeleteWeightGoalUseCase(weightUnitOfWork)

  return deleteWeightGoalUseCase
}
