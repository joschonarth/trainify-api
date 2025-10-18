import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { DeleteWeightLogUseCase } from '../delete-weight-log.use-case'
import { makeCalculateWeightGoalProgressUseCase } from './make-calculate-weight-goal-progress-use-case'

export function makeDeleteWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const calculateWeightGoalProgressUseCase =
    makeCalculateWeightGoalProgressUseCase()

  const deleteWeightLogUseCase = new DeleteWeightLogUseCase(
    weightLogsRepository,
    calculateWeightGoalProgressUseCase,
  )

  return deleteWeightLogUseCase
}
