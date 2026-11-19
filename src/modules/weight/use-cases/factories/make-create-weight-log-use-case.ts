import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaWeightGoalsRepository } from '../../repositories/prisma/prisma-weight-goals.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { AchieveWeightGoalUseCase } from '../achieve-weight-goal.use-case'
import { CreateWeightLogUseCase } from '../create-weight-log.use-case'

export function makeCreateWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const weightGoalsRepository = new PrismaWeightGoalsRepository()
  const usersRepository = new PrismaUsersRepository()

  const achieveWeightGoalUseCase = new AchieveWeightGoalUseCase(
    weightGoalsRepository,
    weightLogsRepository
  )

  const createWeightLogUseCase = new CreateWeightLogUseCase(
    weightLogsRepository,
    weightGoalsRepository,
    achieveWeightGoalUseCase,
    usersRepository
  )

  return createWeightLogUseCase
}
