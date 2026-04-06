import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import type { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface DeleteWeightGoalRequest {
  goalId: string
  userId: string
}

export class DeleteWeightGoalUseCase {
  constructor(
    private readonly weightGoalsRepository: WeightGoalsRepository,
    private readonly weightLogsRepository: WeightLogsRepository
  ) {}

  async execute({ goalId, userId }: DeleteWeightGoalRequest): Promise<void> {
    const goal = await this.weightGoalsRepository.findById(goalId)

    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    const logs = await this.weightLogsRepository.findByGoalId(goalId)

    if (logs.length > 0) {
      await Promise.all(
        logs.map((log) =>
          this.weightLogsRepository.update(log.id, { goalId: null })
        )
      )
    }

    await this.weightGoalsRepository.delete(goalId)
  }
}
