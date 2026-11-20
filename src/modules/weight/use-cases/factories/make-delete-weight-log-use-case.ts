import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { DeleteWeightLogUseCase } from '../delete-weight-log.use-case'
import { makeCalculateWeightGoalProgressUseCase } from './make-calculate-weight-goal-progress-use-case'

export function makeDeleteWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const calculateWeightGoalProgressUseCase =
    makeCalculateWeightGoalProgressUseCase()
  const usersRepository = new PrismaUsersRepository()

  const deleteWeightLogUseCase = new DeleteWeightLogUseCase(
    weightLogsRepository,
    calculateWeightGoalProgressUseCase,
    usersRepository
  )

  return deleteWeightLogUseCase
}
