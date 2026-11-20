import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightUnitOfWork } from '../repositories/weight-unit-of-work'
import { syncUserWeightFromLatestLog } from '../utils/sync-user-weight-from-latest-log'
import type { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'

interface DeleteWeightLogRequest {
  logId: string
  userId: string
}

export class DeleteWeightLogUseCase {
  constructor(
    private readonly weightUnitOfWork: WeightUnitOfWork,
    private readonly calculateWeightGoalProgressUseCase: CalculateWeightGoalProgressUseCase
  ) {}

  async execute({ logId, userId }: DeleteWeightLogRequest): Promise<void> {
    await this.weightUnitOfWork.execute(userId, async (repositories) => {
      const log = await repositories.logs.findById(logId)

      if (!log || log.userId !== userId) {
        throw new ResourceNotFoundError('Weight log not found')
      }

      await repositories.logs.delete(logId)
      await syncUserWeightFromLatestLog(
        userId,
        repositories.users,
        repositories.logs
      )

      if (log.goalId) {
        await this.calculateWeightGoalProgressUseCase.executeInTransaction(
          log.goalId,
          userId,
          repositories
        )
      }
    })
  }
}
