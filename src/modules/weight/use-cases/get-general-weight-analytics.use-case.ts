import type { WeightLogsRepository } from '../repositories/weight-logs.repository'
import { calculateWeightAnalytics } from '../utils/calculate-weight-analytics'

interface GetGeneralWeightAnalyticsRequest {
  userId: string
  from?: Date
  to?: Date
}

interface WeightDataPoint {
  date: Date
  weight: number
}

interface GetGeneralWeightAnalyticsResponse {
  dataPoints: WeightDataPoint[]
  avgChangePerWeek: number
  trendDirection: 'increasing' | 'decreasing' | 'stable'
}

export class GetGeneralWeightAnalyticsUseCase {
  constructor(private readonly weightLogsRepository: WeightLogsRepository) {}

  async execute({
    userId,
    from,
    to,
  }: GetGeneralWeightAnalyticsRequest): Promise<GetGeneralWeightAnalyticsResponse> {
    const filters =
      from || to
        ? {
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
          }
        : undefined

    const logs = await this.weightLogsRepository.findManyByUserId(
      userId,
      filters
    )

    return calculateWeightAnalytics(logs)
  }
}
