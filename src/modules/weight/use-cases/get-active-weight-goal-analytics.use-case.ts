import type { WeightGoalsRepository } from '../repositories/weight-goals.repository'
import type { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { calculateWeightAnalytics } from '../utils/calculate-weight-analytics'

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
    private readonly weightLogsRepository: WeightLogsRepository,
    private readonly weightGoalsRepository: WeightGoalsRepository
  ) {}

  async execute({
    userId,
  }: GetActiveWeightGoalAnalyticsRequest): Promise<GetActiveWeightGoalAnalyticsResponse> {
    const activeGoal =
      await this.weightGoalsRepository.findActiveGoalByUserId(userId)

    if (!activeGoal) {
      return calculateWeightAnalytics([])
    }

    const logs = await this.weightLogsRepository.findByGoalId(activeGoal.id)
    return calculateWeightAnalytics(logs)
  }
}
