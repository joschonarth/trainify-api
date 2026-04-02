import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightLogsRepository } from '../repositories/weight-logs.repository'
import type { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'

interface DeleteWeightLogRequest {
  logId: string
  userId: string
}

export class DeleteWeightLogUseCase {
  constructor(
    private readonly weightLogsRepository: WeightLogsRepository,
    private readonly calculateWeightGoalProgressUseCase: CalculateWeightGoalProgressUseCase
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
