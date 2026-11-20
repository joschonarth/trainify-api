import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import type { WeightUnitOfWork } from '../repositories/weight-unit-of-work'
import { syncUserWeightFromLatestLog } from '../utils/sync-user-weight-from-latest-log'
import type { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'

interface UpdateWeightLogRequest {
  logId: string
  userId: string
  weight?: number | undefined
  note?: string | null | undefined
  date?: Date | undefined
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
    private readonly weightUnitOfWork: WeightUnitOfWork,
    private readonly calculateWeightGoalProgressUseCase: CalculateWeightGoalProgressUseCase
  ) {}

  async execute({
    logId,
    userId,
    weight,
    note,
    date,
  }: UpdateWeightLogRequest): Promise<UpdateWeightLogResponse> {
    if (weight !== undefined && (!Number.isFinite(weight) || weight <= 0)) {
      throw new InvalidWeightGoalError(
        'Weight must be a positive finite number.'
      )
    }

    if (date !== undefined && !Number.isFinite(date.getTime())) {
      throw new InvalidWeightGoalError('Log date must be valid.')
    }

    return await this.weightUnitOfWork.execute(userId, async (repositories) => {
      const log = await repositories.logs.findById(logId)

      if (!log || log.userId !== userId) {
        throw new ResourceNotFoundError('Weight log not found')
      }

      const updatedLog = await repositories.logs.update(logId, {
        ...(weight === undefined ? {} : { weight }),
        ...(note === undefined ? {} : { note }),
        ...(date === undefined ? {} : { date }),
      })

      await syncUserWeightFromLatestLog(
        userId,
        repositories.users,
        repositories.logs
      )

      if (updatedLog.goalId) {
        await this.calculateWeightGoalProgressUseCase.executeInTransaction(
          updatedLog.goalId,
          userId,
          repositories
        )
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
    })
  }
}
