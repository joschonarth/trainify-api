import { WeightGoal } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WeightGoalsRepository } from '../repositories/weight-goals.repository'

interface GetWeightGoalUseCaseRequest {
  goalId: string
  userId: string
}

interface GetWeightGoalUseCaseResponse {
  weightGoal: WeightGoal & {
    logs: {
      id: string
      weight: number
      note: string | null
      date: Date
      createdAt: Date
    }[]
  }
}

export class GetWeightGoalUseCase {
  constructor(private weightGoalsRepository: WeightGoalsRepository) {}

  async execute({
    goalId,
    userId,
  }: GetWeightGoalUseCaseRequest): Promise<GetWeightGoalUseCaseResponse> {
    const goal = await this.weightGoalsRepository.findById(goalId)

    if (!goal || goal.userId !== userId) {
      throw new ResourceNotFoundError('Weight goal not found')
    }

    return { weightGoal: goal }
  }
}
