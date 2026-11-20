import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { UpdateWeightLogUseCase } from '../update-weight-log.use-case'
import { makeCalculateWeightGoalProgressUseCase } from './make-calculate-weight-goal-progress-use-case'

export function makeUpdateWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const calculateWeightGoalProgressUseCase =
    makeCalculateWeightGoalProgressUseCase()
  const usersRepository = new PrismaUsersRepository()

  const updateWeightLogUseCase = new UpdateWeightLogUseCase(
    weightLogsRepository,
    calculateWeightGoalProgressUseCase,
    usersRepository
  )

  return updateWeightLogUseCase
}
