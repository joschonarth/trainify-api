import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type {
  WeightRepositories,
  WeightUnitOfWork,
} from '../repositories/weight-unit-of-work'
import { calculateWeightGoalProgress } from '../utils/calculate-weight-goal-progress'

interface CalculateWeightGoalProgressRequest {
  goalId: string
  userId: string
}

interface CalculateWeightGoalProgressResponse {
  goalId: string
  progress: number
  achieved: boolean
}

export class CalculateWeightGoalProgressUseCase {
  constructor(private readonly weightUnitOfWork: WeightUnitOfWork) {}

  async execute({
    goalId,
    userId,
  }: CalculateWeightGoalProgressRequest): Promise<CalculateWeightGoalProgressResponse> {
    return await this.weightUnitOfWork.execute(userId, (repositories) =>
      this.executeInTransaction(goalId, userId, repositories)
    )
  }

  async executeInTransaction(
    goalId: string,
    userId: string,
    repositories: WeightRepositories
  ): Promise<CalculateWeightGoalProgressResponse> {
    const goal = await repositories.goals.findById(goalId)

    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    const latestLog = await repositories.logs.findLatestByGoalId(goalId)
    if (!latestLog) {
      await repositories.goals.updateProgress(goal.id, 0)
      return { goalId: goal.id, progress: 0, achieved: false }
    }

    const logs =
      goal.goalType === 'MAINTAIN'
        ? await repositories.logs.findByGoalId(goalId)
        : []

    const progress = calculateWeightGoalProgress(goal, latestLog.weight, logs)
    await repositories.goals.updateProgress(goal.id, progress)

    let achieved = false
    if (goal.goalType !== 'MAINTAIN' && progress >= 100 && goal.isActive) {
      await repositories.goals.markAsAchieved(goal.id, new Date())
      await repositories.goals.updateProgress(goal.id, 100)
      achieved = true
    }

    return { goalId: goal.id, progress, achieved }
  }
}
