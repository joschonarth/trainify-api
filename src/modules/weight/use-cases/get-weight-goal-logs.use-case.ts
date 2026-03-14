import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import type { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface GetWeightGoalLogsUseCaseRequest {
  goalId: string
  userId: string
}

interface GetWeightGoalLogsUseCaseResponse {
  logs: {
    id: string
    weight: number
    note: string | null
    date: Date
    createdAt: Date
  }[]
}

export class GetWeightGoalLogsUseCase {
  constructor(
    private weightGoalsRepository: WeightGoalsRepository,
    private weightLogsRepository: WeightLogsRepository
  ) {}

  async execute({
    goalId,
    userId,
  }: GetWeightGoalLogsUseCaseRequest): Promise<GetWeightGoalLogsUseCaseResponse> {
    const goal = await this.weightGoalsRepository.findById(goalId)

    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    const logs = await this.weightLogsRepository.findByGoalId(goalId)

    return { logs }
  }
}
