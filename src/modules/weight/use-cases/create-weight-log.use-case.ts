import { WeightLog } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { AchieveWeightGoalUseCase } from '../use-cases/achieve-weight-goal.use-case'
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
    private weightLogsRepository: WeightLogsRepository,
    private weightGoalsRepository: WeightGoalsRepository,
    private achieveWeightGoalUseCase: AchieveWeightGoalUseCase,
  ) {}

  async execute({
    userId,
    weight,
    note,
    goalId,
  }: CreateWeightLogUseCaseRequest): Promise<CreateWeightLogUseCaseResponse> {
    if (!goalId) {
      const weightLog = await this.weightLogsRepository.create({
        userId,
        goalId: null,
        weight,
        note: note ?? null,
      })
      return { weightLog }
    }

    const goal = await this.weightGoalsRepository.findById(goalId)

    if (!goal) {
      throw new ResourceNotFoundError('Weight goal not found.')
    }

    if (!goal.isActive) {
      throw new InvalidWeightGoalError()
    }

    const weightLog = await this.weightLogsRepository.create({
      userId,
      goalId,
      weight,
      note: note ?? null,
    })

    let startWeight = goal.startWeight
    if (!startWeight) {
      startWeight = weight
      await this.weightGoalsRepository.update(goal.id, { startWeight: weight })
    }

    const progress = calculateWeightGoalProgress(
      { ...goal, startWeight },
      weightLog.weight,
    )
    await this.weightGoalsRepository.updateProgress(goal.id, progress)

    if (progress >= 100) {
      await this.achieveWeightGoalUseCase.execute({ goalId: goal.id, userId })
    }

    return { weightLog }
  }
}
