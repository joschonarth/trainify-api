import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { CalculateWeightGoalProgressUseCase } from '../calculate-weight-goal-progress.use-case'

export function makeCalculateWeightGoalProgressUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const calculateWeightGoalProgressUseCase =
    new CalculateWeightGoalProgressUseCase(weightUnitOfWork)

  return calculateWeightGoalProgressUseCase
}
