import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { calculateWeightGoalProgress } from '../utils/calculate-weight-goal-progress'
import { AchieveWeightGoalUseCase } from './achieve-weight-goal.use-case'

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
  constructor(
    private weightGoalsRepository: WeightGoalsRepository,
    private weightLogsRepository: WeightLogsRepository,
    private achieveWeightGoalUseCase: AchieveWeightGoalUseCase,
  ) {}

  async execute({
    goalId,
    userId,
  }: CalculateWeightGoalProgressRequest): Promise<CalculateWeightGoalProgressResponse> {
    const goal = await this.weightGoalsRepository.findById(goalId)

    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    const latestLog = await this.weightLogsRepository.findLatestByGoalId(goalId)
    if (!latestLog) {
      await this.weightGoalsRepository.updateProgress(goal.id, 0)
      return { goalId: goal.id, progress: 0, achieved: false }
    }

    const logs =
      goal.goalType === 'MAINTAIN'
        ? await this.weightLogsRepository.findByGoalId(goalId)
        : []

    const progress = calculateWeightGoalProgress(goal, latestLog.weight, logs)
    await this.weightGoalsRepository.updateProgress(goal.id, progress)

    let achieved = false
    if (goal.goalType !== 'MAINTAIN' && progress >= 100 && goal.isActive) {
      await this.achieveWeightGoalUseCase.execute({ goalId: goal.id, userId })
      achieved = true
    }

    return { goalId: goal.id, progress, achieved }
  }
}
