import type { GoalType, WeightGoal } from 'generated/prisma'

import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'

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
  constructor(private readonly weightGoalsRepository: WeightGoalsRepository) {}

  async execute({
    userId,
    name,
    description,
    goalType,
    targetWeight,
    startDate,
    endDate,
  }: CreateWeightGoalUseCaseRequest): Promise<CreateWeightGoalUseCaseResponse> {
    await this.weightGoalsRepository.deactivateAllByUserId(userId)

    const weightGoal = await this.weightGoalsRepository.create({
      userId,
      name,
      description: description ?? null,
      goalType,
      targetWeight,
      startDate: startDate ?? new Date(),
      endDate: endDate ?? null,
    })

    return { weightGoal }
  }
}
