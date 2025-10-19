import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface DeleteWeightGoalRequest {
  goalId: string
  userId: string
}

export class DeleteWeightGoalUseCase {
  constructor(
    private weightGoalsRepository: WeightGoalsRepository,
    private weightLogsRepository: WeightLogsRepository,
  ) {}

  async execute({ goalId, userId }: DeleteWeightGoalRequest): Promise<void> {
    const goal = await this.weightGoalsRepository.findById(goalId)

    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    if (goal.logs.length > 0) {
      await Promise.all(
        goal.logs.map((log) =>
          this.weightLogsRepository.update(log.id, { goalId: null }),
        ),
      )
    }

    await this.weightGoalsRepository.delete(goalId)
  }
}
