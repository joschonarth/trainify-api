import type { WeightGoal } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'

interface GetWeightGoalUseCaseRequest {
  goalId: string
  userId: string
}

interface GetWeightGoalUseCaseResponse {
  weightGoal: WeightGoal
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
