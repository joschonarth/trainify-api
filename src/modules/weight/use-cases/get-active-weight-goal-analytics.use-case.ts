import { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import { WeightLogsRepository } from '../repositories/weight-logs.repository'

interface GetActiveWeightGoalAnalyticsRequest {
  userId: string
}

interface WeightDataPoint {
  date: Date
  weight: number
}

interface GetActiveWeightGoalAnalyticsResponse {
  dataPoints: WeightDataPoint[]
  avgChangePerWeek: number
  trendDirection: 'increasing' | 'decreasing' | 'stable'
}

export class GetActiveWeightGoalAnalyticsUseCase {
  constructor(
    private weightLogsRepository: WeightLogsRepository,
    private weightGoalsRepository: WeightGoalsRepository,
  ) {}

  async execute({
    userId,
  }: GetActiveWeightGoalAnalyticsRequest): Promise<GetActiveWeightGoalAnalyticsResponse> {
    const activeGoal =
      await this.weightGoalsRepository.findActiveGoalByUserId(userId)
    if (!activeGoal) {
      return { dataPoints: [], avgChangePerWeek: 0, trendDirection: 'stable' }
    }

    const logs = await this.weightLogsRepository.findByGoalId(activeGoal.id)
    if (logs.length === 0) {
      return { dataPoints: [], avgChangePerWeek: 0, trendDirection: 'stable' }
    }

    const sorted = logs.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )

    const dataPoints = sorted.map((l) => ({
      date: l.createdAt,
      weight: l.weight,
    }))

    if (sorted.length === 1) {
      return { dataPoints, avgChangePerWeek: 0, trendDirection: 'stable' }
    }

    const start = sorted.at(0)!
    const end = sorted.at(-1)!

    const daysDiff =
      (end.createdAt.getTime() - start.createdAt.getTime()) /
      (1000 * 60 * 60 * 24)
    const weeksDiff = daysDiff >= 7 ? daysDiff / 7 : 1
    const avgChangePerWeek = (end.weight - start.weight) / weeksDiff

    const trendDirection =
      Math.abs(avgChangePerWeek) < 0.1
        ? 'stable'
        : avgChangePerWeek > 0
          ? 'increasing'
          : 'decreasing'

    return { dataPoints, avgChangePerWeek, trendDirection }
  }
}
