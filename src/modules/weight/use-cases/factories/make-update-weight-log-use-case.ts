import { PrismaWeightLogsRepository } from '../../repositories/prisma/prisma-weight-logs.repository'
import { UpdateWeightLogUseCase } from '../update-weight-log.use-case'
import { makeCalculateWeightGoalProgressUseCase } from './make-calculate-weight-goal-progress-use-case'

export function makeUpdateWeightLogUseCase() {
  const weightLogsRepository = new PrismaWeightLogsRepository()
  const calculateWeightGoalProgressUseCase =
    makeCalculateWeightGoalProgressUseCase()

  const updateWeightLogUseCase = new UpdateWeightLogUseCase(
    weightLogsRepository,
    calculateWeightGoalProgressUseCase
  )

  return updateWeightLogUseCase
}
