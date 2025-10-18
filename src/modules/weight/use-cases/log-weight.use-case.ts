import { WeightLog } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { calculateWeightGoalProgress } from '../utils/calculate-weight-goal-progress'
import { AchieveWeightGoalUseCase } from './achieve-weight-goal.use-case'

interface LogWeightUseCaseRequest {
  userId: string
  weight: number
  note?: string | null
  goalId?: string | null
}

interface LogWeightUseCaseResponse {
  weightLog: WeightLog
}

export class LogWeightUseCase {
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
  }: LogWeightUseCaseRequest): Promise<LogWeightUseCaseResponse> {
    if (goalId) {
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

      const progress = calculateWeightGoalProgress(goal, weight)
      await this.weightGoalsRepository.updateProgress(goal.id, progress)

      if (progress >= 100) {
        await this.achieveWeightGoalUseCase.execute({ goalId: goal.id, userId })
      }

      return { weightLog }
    }

    const weightLog = await this.weightLogsRepository.create({
      userId,
      goalId: null,
      weight,
      note: note ?? null,
    })

    return { weightLog }
  }
}
