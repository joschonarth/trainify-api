import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightUnitOfWork } from '../repositories/weight-unit-of-work'

interface DeactivateWeightGoalRequest {
  goalId: string
  userId: string
}

export class DeactivateWeightGoalUseCase {
  constructor(private readonly weightUnitOfWork: WeightUnitOfWork) {}

  async execute({
    goalId,
    userId,
  }: DeactivateWeightGoalRequest): Promise<void> {
    await this.weightUnitOfWork.execute(userId, async ({ goals }) => {
      const goal = await goals.findById(goalId)

      if (!goal || goal.userId !== userId) {
        throw new ResourceNotFoundError('Weight goal not found')
      }

      if (!goal.isActive) {
        return
      }

      await goals.deactivateGoal(goalId)
    })
  }
}
