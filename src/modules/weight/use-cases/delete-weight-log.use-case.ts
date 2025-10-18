import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'

interface DeleteWeightLogRequest {
  logId: string
  userId: string
}

export class DeleteWeightLogUseCase {
  constructor(
    private weightLogsRepository: WeightLogsRepository,
    private calculateWeightGoalProgressUseCase: CalculateWeightGoalProgressUseCase,
  ) {}

  async execute({ logId, userId }: DeleteWeightLogRequest): Promise<void> {
    const log = await this.weightLogsRepository.findById(logId)

    if (!log || log.userId !== userId) {
      throw new ResourceNotFoundError('Weight log not found')
    }

    await this.weightLogsRepository.delete(logId)

    if (log.goalId) {
      await this.calculateWeightGoalProgressUseCase.execute({
        goalId: log.goalId,
        userId,
      })
    }
  }
}
