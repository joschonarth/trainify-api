import { WeightLog } from '@prisma/client'

import { WeightGoalsRepository } from '@/repositories/weight-goals.repository'
import { WeightLogsRepository } from '@/repositories/weight-logs.repository'
import { calculateWeightGoalProgress } from '@/utils/calculate-weight-goal-progress'

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
  ) {}

  async execute({
    userId,
    weight,
    note,
    goalId,
  }: LogWeightUseCaseRequest): Promise<LogWeightUseCaseResponse> {
    const weightLog = await this.weightLogsRepository.create({
      userId,
      goalId: goalId ?? null,
      weight,
      note: note ?? null,
    })

    if (goalId) {
      const goal = await this.weightGoalsRepository.findById(goalId)

      if (goal && goal.isActive) {
        const progress = calculateWeightGoalProgress(goal, weight)

        await this.weightGoalsRepository.updateProgress(goal.id, progress)
      }
    }

    return { weightLog }
  }
}
