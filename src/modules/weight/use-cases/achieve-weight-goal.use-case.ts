import type { WeightGoal } from 'generated/prisma'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
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

      if (goal.achievedAt) {
        return {
          weightGoal: { ...goal, progress: 100 },
          progress: 100,
        }
      }

      if (!goal.isActive) {
        throw new NotAllowedError('Cannot achieve an inactive weight goal.')
      }

      const logs = await repositories.logs.findByGoalId(goal.id)
      const minimumLogCount = goal.goalType === 'MAINTAIN' ? 2 : 1

      if (logs.length < minimumLogCount) {
        throw new WeightGoalNotAchievedError(
          'Not enough weight logs to achieve this goal.'
        )
      }

      const latestLog = await repositories.logs.findLatestByGoalId(goal.id)
      if (!latestLog) {
        throw new WeightGoalNotAchievedError(
          'Not enough weight logs to achieve this goal.'
        )
      }

      const progress = calculateWeightGoalProgress(
        goal,
        latestLog.weight,
        goal.goalType === 'MAINTAIN' ? logs : []
      )

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
