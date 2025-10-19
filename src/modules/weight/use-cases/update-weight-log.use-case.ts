import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'

interface UpdateWeightLogRequest {
  logId: string
  userId: string
  weight?: number | undefined
  note?: string | null | undefined
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
    private calculateWeightGoalProgressUseCase: CalculateWeightGoalProgressUseCase,
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
      await this.calculateWeightGoalProgressUseCase.execute({
        goalId: updatedLog.goalId,
        userId,
      })
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
