import { PrismaWeightGoalsRepository } from '@/modules/weight/repositories/prisma/prisma-weight-goals.repository'

import { GetWeightGoalUseCase } from '../get-weight-goal.use-case'

export function makeGetWeightGoalUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const getWeightGoalUseCase = new GetWeightGoalUseCase(weightGoalsRepository)

  return getWeightGoalUseCase
}
