import { WeightGoal } from '@prisma/client'

import { InvalidWeightGoalError } from '@/errors/invalid-weight-goal.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WeightGoalsRepository } from '@/repositories/weight-goals.repository'
import { WeightLogsRepository } from '@/repositories/weight-logs.repository'

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
  constructor(
    private weightGoalsRepository: WeightGoalsRepository,
    private weightLogsRepository: WeightLogsRepository,
  ) {}

  async execute({
    goalId,
    userId,
    name,
    description,
    endDate,
  }: UpdateWeightGoalRequest): Promise<UpdateWeightGoalResponse> {
    const goal = await this.weightGoalsRepository.findById(goalId)
    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    if (goal.achievedAt) {
      throw new InvalidWeightGoalError(
        'Cannot edit a goal that has already been achieved',
      )
    }

    if (endDate) {
      if (endDate < goal.startDate) {
        throw new InvalidWeightGoalError('End date cannot be before start date')
      }

      const latestLog =
        await this.weightLogsRepository.findLatestByGoalId(goalId)
      if (latestLog && endDate < latestLog.date) {
        throw new InvalidWeightGoalError(
          'End date cannot be before the last logged weight date',
        )
      }
    }

    const updatedGoal = await this.weightGoalsRepository.update(goalId, {
      name: name ?? goal.name,
      description: description ?? goal.description,
      endDate: endDate ?? goal.endDate,
    })

    return { weightGoal: updatedGoal }
  }
}
