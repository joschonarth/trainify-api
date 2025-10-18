import { WeightGoal } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface WeightSummaryResponse {
  currentWeight: number | null
  startWeight: number | null
  variation: number | null
  averageWeight: number | null
  minWeight: number | null
  maxWeight: number | null
  lastLogDate: Date | null
  activeGoal: WeightGoal | null
}

export class GetWeightSummaryUseCase {
  constructor(
    private weightGoalsRepository: WeightGoalsRepository,
    private weightLogsRepository: WeightLogsRepository,
  ) {}

  async execute(userId: string): Promise<WeightSummaryResponse> {
    const latestLog = await this.weightLogsRepository.findLatestByUserId(userId)
    const firstLog = await this.weightLogsRepository.findFirstByUserId(userId)
    const avgWeight =
      await this.weightLogsRepository.findAverageByUserId(userId)
    const minWeightLog = await this.weightLogsRepository.findMinByUserId(userId)
    const maxWeightLog = await this.weightLogsRepository.findMaxByUserId(userId)

    const activeGoal =
      await this.weightGoalsRepository.findActiveGoalByUserId(userId)

    if (!latestLog && !firstLog) {
      throw new ResourceNotFoundError('No weight logs found for this user.')
    }

    const currentWeight = latestLog?.weight ?? null
    const startWeight = firstLog?.weight ?? null
    const variation =
      currentWeight && startWeight ? currentWeight - startWeight : null

    return {
      currentWeight,
      startWeight,
      variation,
      averageWeight: avgWeight ?? null,
      minWeight: minWeightLog?.weight ?? null,
      maxWeight: maxWeightLog?.weight ?? null,
      lastLogDate: latestLog?.createdAt ?? null,
      activeGoal,
    }
  }
}
