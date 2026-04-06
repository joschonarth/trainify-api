import type { WeightGoal, WeightLog } from 'generated/prisma'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import type { WeightLogsRepository } from '../repositories/weight-logs.repository'
import type { AchieveWeightGoalUseCase } from '../use-cases/achieve-weight-goal.use-case'
import { calculateWeightGoalProgress } from '../utils/calculate-weight-goal-progress'

interface CreateWeightLogUseCaseRequest {
  userId: string
  weight: number
  note?: string | null
  goalId?: string | null
}

interface CreateWeightLogUseCaseResponse {
  weightLog: WeightLog
}

export class CreateWeightLogUseCase {
  constructor(
    private readonly weightLogsRepository: WeightLogsRepository,
    private readonly weightGoalsRepository: WeightGoalsRepository,
    private readonly achieveWeightGoalUseCase: AchieveWeightGoalUseCase
  ) {}

  async execute({
    userId,
    weight,
    note,
    goalId,
  }: CreateWeightLogUseCaseRequest): Promise<CreateWeightLogUseCaseResponse> {
    let goal: WeightGoal | null = null

    if (goalId) {
      goal = await this.weightGoalsRepository.findById(goalId)
      if (!goal) {
        throw new ResourceNotFoundError('Weight goal not found.')
      }
    } else {
      goal = await this.weightGoalsRepository.findActiveGoalByUserId(userId)
    }

    if (!goal) {
      const weightLog = await this.weightLogsRepository.create({
        userId,
        goalId: null,
        weight,
        note: note ?? null,
      })
      return { weightLog }
    }

    if (!goal.isActive) {
      throw new InvalidWeightGoalError()
    }

    const weightLog = await this.weightLogsRepository.create({
      userId,
      goalId: goal.id,
      weight,
      note: note ?? null,
    })

    let startWeight = goal.startWeight
    if (!startWeight) {
      startWeight = weight
      await this.weightGoalsRepository.update(goal.id, {
        startWeight: weight,
      })
    }

    const logs =
      goal.goalType === 'MAINTAIN'
        ? await this.weightLogsRepository.findByGoalId(goal.id)
        : []

    const progress = calculateWeightGoalProgress(
      { ...goal, startWeight },
      weightLog.weight,
      logs
    )
    await this.weightGoalsRepository.updateProgress(goal.id, progress)

    if (goal.goalType !== 'MAINTAIN' && progress >= 100 && goal.isActive) {
      await this.achieveWeightGoalUseCase.execute({
        goalId: goal.id,
        userId,
      })
    }

    return { weightLog }
  }
}
