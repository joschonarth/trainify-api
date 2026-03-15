import type { WeightGoal } from 'generated/prisma'

import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'

interface ListWeightGoalsUseCaseRequest {
  userId: string
  status?: 'active' | 'completed'
}

interface ListWeightGoalsUseCaseResponse {
  weightGoals: WeightGoal[]
}

export class ListWeightGoalsUseCase {
  constructor(private readonly weightGoalsRepository: WeightGoalsRepository) {}

  async execute({
    userId,
    status,
  }: ListWeightGoalsUseCaseRequest): Promise<ListWeightGoalsUseCaseResponse> {
    const filters = status ? { status } : undefined

    const weightGoals = await this.weightGoalsRepository.findAllByUserId(
      userId,
      filters
    )

    return { weightGoals }
  }
}
