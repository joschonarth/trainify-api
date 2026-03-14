import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'

interface DeactivateWeightGoalRequest {
  goalId: string
  userId: string
}

export class DeactivateWeightGoalUseCase {
  constructor(private weightGoalsRepository: WeightGoalsRepository) {}

  async execute({
    goalId,
    userId,
  }: DeactivateWeightGoalRequest): Promise<void> {
    const goal = await this.weightGoalsRepository.findById(goalId)

    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    if (!goal.isActive) {
      return
    }

    await this.weightGoalsRepository.deactivateGoal(goalId)
  }
}
