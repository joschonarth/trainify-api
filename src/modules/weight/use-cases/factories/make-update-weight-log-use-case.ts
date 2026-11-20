import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { CalculateWeightGoalProgressUseCase } from '../calculate-weight-goal-progress.use-case'
import { UpdateWeightLogUseCase } from '../update-weight-log.use-case'

export function makeUpdateWeightLogUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const calculateWeightGoalProgressUseCase =
    new CalculateWeightGoalProgressUseCase(weightUnitOfWork)

  const updateWeightLogUseCase = new UpdateWeightLogUseCase(
    weightUnitOfWork,
    calculateWeightGoalProgressUseCase
  )

  return updateWeightLogUseCase
}
