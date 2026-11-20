import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { CalculateWeightGoalProgressUseCase } from '../calculate-weight-goal-progress.use-case'
import { DeleteWeightLogUseCase } from '../delete-weight-log.use-case'

export function makeDeleteWeightLogUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const calculateWeightGoalProgressUseCase =
    new CalculateWeightGoalProgressUseCase(weightUnitOfWork)

  const deleteWeightLogUseCase = new DeleteWeightLogUseCase(
    weightUnitOfWork,
    calculateWeightGoalProgressUseCase
  )

  return deleteWeightLogUseCase
}
