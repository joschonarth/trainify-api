import { WeightGoal } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WeightGoalsRepository } from '../repositories/weight-goals.repository'

export class GetActiveWeightGoalUseCase {
  constructor(private weightGoalsRepository: WeightGoalsRepository) {}

  async execute(userId: string): Promise<WeightGoal | null> {
    const activeGoal =
      await this.weightGoalsRepository.findActiveGoalByUserId(userId)

    if (!activeGoal) {
      throw new ResourceNotFoundError(
        'No active weight goal found for this user.',
      )
    }

    return activeGoal
  }
}
