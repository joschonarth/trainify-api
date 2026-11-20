import type { WeightGoal } from 'generated/prisma'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WeightGoalNotAchievedError } from '../errors/weight-goal-not-achieved.error'
import type { WeightUnitOfWork } from '../repositories/weight-unit-of-work'
import { calculateWeightGoalProgress } from '../utils/calculate-weight-goal-progress'

interface AchieveWeightGoalUseCaseRequest {
  goalId: string
  userId: string
}

interface AchieveWeightGoalUseCaseResponse {
  weightGoal: WeightGoal
  progress: number
}

export class AchieveWeightGoalUseCase {
  constructor(private readonly weightUnitOfWork: WeightUnitOfWork) {}

  async execute({
    goalId,
    userId,
  }: AchieveWeightGoalUseCaseRequest): Promise<AchieveWeightGoalUseCaseResponse> {
    return await this.weightUnitOfWork.execute(userId, async (repositories) => {
      const goal = await repositories.goals.findById(goalId)
      if (!goal || goal.userId !== userId) {
        throw new ResourceNotFoundError('Weight goal not found')
      }

      const latestLog = await repositories.logs.findLatestByUserId(userId)
      if (!latestLog) {
        throw new ResourceNotFoundError('No weight logs found for user')
      }

      const progress = calculateWeightGoalProgress(goal, latestLog.weight)

      if (progress < 100) {
        throw new WeightGoalNotAchievedError('Weight goal not yet achieved.')
      }

      const achievedAt = new Date()

      await repositories.goals.markAsAchieved(goal.id, achievedAt)
      await repositories.goals.updateProgress(goal.id, 100)

      return {
        weightGoal: { ...goal, achievedAt, isActive: false, progress: 100 },
        progress,
      }
    })
  }
}
