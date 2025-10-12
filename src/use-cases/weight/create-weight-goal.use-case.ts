import { GoalType, WeightGoal } from '@prisma/client'

import { WeightGoalsRepository } from '@/repositories/weight-goals.repository'

interface CreateWeightGoalUseCaseRequest {
  userId: string
  goalType: GoalType
  startWeight: number
  targetWeight: number
  startDate?: Date
  endDate?: Date | null
}

interface CreateWeightGoalUseCaseResponse {
  weightGoal: WeightGoal
}

export class CreateWeightGoalUseCase {
  constructor(private weightGoalsRepository: WeightGoalsRepository) {}

  async execute({
    userId,
    goalType,
    startWeight,
    targetWeight,
    startDate,
    endDate,
  }: CreateWeightGoalUseCaseRequest): Promise<CreateWeightGoalUseCaseResponse> {
    const activeGoal =
      await this.weightGoalsRepository.findActiveGoalByUserId(userId)

    if (activeGoal) {
      await this.weightGoalsRepository.deactivateGoal(activeGoal.id)
    }

    const weightGoal = await this.weightGoalsRepository.create({
      userId,
      goalType,
      startWeight,
      targetWeight,
      startDate: startDate ?? new Date(),
      endDate: endDate ?? null,
    })

    return { weightGoal }
  }
}
