import { PrismaWeightUnitOfWork } from '../../repositories/prisma/prisma-weight-unit-of-work'
import { AchieveWeightGoalUseCase } from '../achieve-weight-goal.use-case'

export function makeAchieveWeightGoalUseCase() {
  const weightUnitOfWork = new PrismaWeightUnitOfWork()
  const achieveWeightGoalUseCase = new AchieveWeightGoalUseCase(
    weightUnitOfWork
  )

  return achieveWeightGoalUseCase
}
