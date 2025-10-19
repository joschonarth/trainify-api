import { WeightGoal } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WeightGoalNotAchievedError } from '../errors/weight-goal-not-achieved.error'
import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'
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
  constructor(
    private weightGoalsRepository: WeightGoalsRepository,
    private weightLogsRepository: WeightLogsRepository,
  ) {}

  async execute({
    goalId,
    userId,
  }: AchieveWeightGoalUseCaseRequest): Promise<AchieveWeightGoalUseCaseResponse> {
    const goal = await this.weightGoalsRepository.findById(goalId)
    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    const latestLog = await this.weightLogsRepository.findLatestByUserId(userId)
    if (!latestLog) {
      throw new ResourceNotFoundError('No weight logs found for user')
    }

    const progress = calculateWeightGoalProgress(goal, latestLog.weight)

    if (progress < 100) {
      throw new WeightGoalNotAchievedError(`Weight goal not yet achieved.`)
    }

    const achievedAt = new Date()

    await Promise.all([
      this.weightGoalsRepository.markAsAchieved(goal.id, achievedAt),
      this.weightGoalsRepository.updateProgress(goal.id, 100),
    ])

    return {
      weightGoal: { ...goal, achievedAt, isActive: false, progress: 100 },
      progress,
    }
  }
}
