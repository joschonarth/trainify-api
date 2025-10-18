import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { ListWeightGoalsUseCase } from '../list-weight-goals.use-case'

export function makeListWeightGoalsUseCase() {
  const weightGoalsRepository = new PrismaWeightGoalsRepository()

  const listWeightGoalsUseCase = new ListWeightGoalsUseCase(
    weightGoalsRepository,
  )

  return listWeightGoalsUseCase
}
