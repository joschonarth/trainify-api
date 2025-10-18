import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { calculateWeightGoalProgress } from '../utils/calculate-weight-goal-progress'
import { AchieveWeightGoalUseCase } from './achieve-weight-goal.use-case'

interface UpdateWeightLogRequest {
  logId: string
  userId: string
  weight?: number
  note?: string | null
}

interface UpdateWeightLogResponse {
  id: string
  userId: string
  goalId: string | null
  weight: number
  note: string | null
  date: Date
  createdAt: Date
}

export class UpdateWeightLogUseCase {
  constructor(
    private weightLogsRepository: WeightLogsRepository,
    private weightGoalsRepository: WeightGoalsRepository,
    private achieveWeightGoalUseCase: AchieveWeightGoalUseCase,
  ) {}

  async execute({
    logId,
    userId,
    weight,
    note,
  }: UpdateWeightLogRequest): Promise<UpdateWeightLogResponse> {
    const log = await this.weightLogsRepository.findById(logId)

    if (!log || log.userId !== userId) {
      throw new ResourceNotFoundError('Weight log not found')
    }

    const updatedLog = await this.weightLogsRepository.update(logId, {
      weight: weight ?? log.weight,
      note: note ?? log.note,
    })

    if (updatedLog.goalId) {
      const goal = await this.weightGoalsRepository.findById(updatedLog.goalId)
      if (goal && goal.isActive) {
        const progress = calculateWeightGoalProgress(goal, updatedLog.weight)
        await this.weightGoalsRepository.updateProgress(goal.id, progress)

        if (progress >= 100) {
          await this.achieveWeightGoalUseCase.execute({
            goalId: goal.id,
            userId,
          })
        }
      }
    }

    return {
      id: updatedLog.id,
      userId: updatedLog.userId,
      goalId: updatedLog.goalId,
      weight: updatedLog.weight,
      note: updatedLog.note,
      date: updatedLog.date,
      createdAt: updatedLog.createdAt,
    }
  }
}
