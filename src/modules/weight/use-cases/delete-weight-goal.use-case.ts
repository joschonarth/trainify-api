import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightUnitOfWork } from '../repositories/weight-unit-of-work'

interface DeleteWeightGoalRequest {
  goalId: string
  userId: string
}

export class DeleteWeightGoalUseCase {
  constructor(private readonly weightUnitOfWork: WeightUnitOfWork) {}

  async execute({ goalId, userId }: DeleteWeightGoalRequest): Promise<void> {
    await this.weightUnitOfWork.execute(userId, async (repositories) => {
      const goal = await repositories.goals.findById(goalId)

      if (!goal || goal.userId !== userId) {
        throw new ResourceNotFoundError('Weight goal not found')
      }

      const logs = await repositories.logs.findByGoalId(goalId)

      await Promise.all(
        logs.map((log) => repositories.logs.update(log.id, { goalId: null }))
      )

      await repositories.goals.delete(goalId)
    })
  }
}
