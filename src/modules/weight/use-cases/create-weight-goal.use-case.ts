import type { GoalType, WeightGoal } from 'generated/prisma'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import type { WeightUnitOfWork } from '../repositories/weight-unit-of-work'

interface CreateWeightGoalUseCaseRequest {
  userId: string
  name: string
  description?: string | null
  goalType: GoalType
  targetWeight: number
  startDate?: Date
  endDate?: Date | null
}

interface CreateWeightGoalUseCaseResponse {
  weightGoal: WeightGoal
}

export class CreateWeightGoalUseCase {
  constructor(private readonly weightUnitOfWork: WeightUnitOfWork) {}

  async execute({
    userId,
    name,
    description,
    goalType,
    targetWeight,
    startDate,
    endDate,
  }: CreateWeightGoalUseCaseRequest): Promise<CreateWeightGoalUseCaseResponse> {
    const goalStartDate = startDate ?? new Date()
    const goalEndDate = endDate ?? null

    if (
      !Number.isFinite(targetWeight) ||
      targetWeight <= 0 ||
      !Number.isFinite(goalStartDate.getTime()) ||
      (goalEndDate &&
        (!Number.isFinite(goalEndDate.getTime()) ||
          goalEndDate < goalStartDate))
    ) {
      throw new InvalidWeightGoalError('Invalid weight goal data.')
    }

    return await this.weightUnitOfWork.execute(userId, async (repositories) => {
      const user = await repositories.users.findById(userId)

      if (!user) {
        throw new ResourceNotFoundError('User not found.')
      }

      const latestLog = await repositories.logs.findLatestByUserId(
        userId,
        goalStartDate
      )
      const startWeight = latestLog?.weight ?? user.weight

      if (
        startWeight !== null &&
        (!Number.isFinite(startWeight) || startWeight <= 0)
      ) {
        throw new InvalidWeightGoalError('Starting weight must be positive.')
      }

      if (
        (goalType === 'LOSE' || goalType === 'GAIN') &&
        startWeight === null
      ) {
        throw new InvalidWeightGoalError(
          'A starting weight is required for this goal type.'
        )
      }

      if (
        goalType === 'LOSE' &&
        startWeight !== null &&
        targetWeight >= startWeight
      ) {
        throw new InvalidWeightGoalError(
          'Target weight must be lower than starting weight for weight loss goals.'
        )
      }

      if (
        goalType === 'GAIN' &&
        startWeight !== null &&
        targetWeight <= startWeight
      ) {
        throw new InvalidWeightGoalError(
          'Target weight must be higher than starting weight for weight gain goals.'
        )
      }

      await repositories.goals.deactivateAllByUserId(userId)

      const weightGoal = await repositories.goals.create({
        userId,
        name,
        description: description ?? null,
        goalType,
        startWeight,
        targetWeight,
        startDate: goalStartDate,
        endDate: goalEndDate,
      })

      return { weightGoal }
    })
  }
}
