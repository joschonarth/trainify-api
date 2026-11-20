import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { CalculateWeightGoalProgressUseCase } from '../calculate-weight-goal-progress.use-case'
import { CreateWeightLogUseCase } from '../create-weight-log.use-case'

export function makeCreateWeightLogUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const calculateWeightGoalProgressUseCase =
    new CalculateWeightGoalProgressUseCase(weightUnitOfWork)

  const createWeightLogUseCase = new CreateWeightLogUseCase(
    weightUnitOfWork,
    calculateWeightGoalProgressUseCase
  )

  return createWeightLogUseCase
}
