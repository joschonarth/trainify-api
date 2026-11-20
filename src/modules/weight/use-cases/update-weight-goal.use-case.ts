import type { WeightGoal } from 'generated/prisma'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import type {
  WeightRepositories,
  WeightUnitOfWork,
} from '../repositories/weight-unit-of-work'

async function validateEndDate(
  endDate: Date | null | undefined,
  startDate: Date,
  goalId: string,
  repositories: WeightRepositories
) {
  if (!endDate) {
    return
  }

  if (!Number.isFinite(endDate.getTime()) || endDate < startDate) {
    throw new InvalidWeightGoalError('End date cannot be before start date')
  }

  const latestLog = await repositories.logs.findLatestByGoalId(goalId)

  if (latestLog && endDate < latestLog.date) {
    throw new InvalidWeightGoalError(
      'End date cannot be before the last logged weight date'
    )
  }
}

interface UpdateWeightGoalRequest {
  goalId: string
  userId: string
  name?: string | undefined
  description?: string | null | undefined
  endDate?: Date | null
}

interface UpdateWeightGoalResponse {
  weightGoal: WeightGoal
}

export class UpdateWeightGoalUseCase {
  constructor(private readonly weightUnitOfWork: WeightUnitOfWork) {}

  async execute({
    goalId,
    userId,
    name,
    description,
    endDate,
  }: UpdateWeightGoalRequest): Promise<UpdateWeightGoalResponse> {
    return await this.weightUnitOfWork.execute(userId, async (repositories) => {
      const goal = await repositories.goals.findById(goalId)
      if (!goal || goal.userId !== userId) {
        throw new ResourceNotFoundError('Weight goal not found')
      }

      if (goal.achievedAt) {
        throw new InvalidWeightGoalError(
          'Cannot edit a goal that has already been achieved'
        )
      }

      await validateEndDate(endDate, goal.startDate, goalId, repositories)

      const updatedGoal = await repositories.goals.update(goalId, {
        ...(name === undefined ? {} : { name }),
        ...(description === undefined ? {} : { description }),
        ...(endDate === undefined ? {} : { endDate }),
      })

      return { weightGoal: updatedGoal }
    })
  }
}
