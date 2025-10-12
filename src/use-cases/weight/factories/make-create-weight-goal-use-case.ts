import { PrismaWeightGoalsRepository } from '@/repositories/prisma/prisma-weight-goals.repository'

import { CreateWeightGoalUseCase } from '../create-weight-goal.use-case'

export function makeCreateWeightGoalUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const createWeightGoalUseCase = new CreateWeightGoalUseCase(
    weightGoalsRepository,
  )

  return createWeightGoalUseCase
}
