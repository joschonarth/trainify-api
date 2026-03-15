import type { WeightLogsRepository } from '../repositories/weight-logs.repository'

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

    if (logs.length < 2) {
      return {
        dataPoints: logs.map((l) => ({ date: l.createdAt, weight: l.weight })),
        avgChangePerWeek: 0,
        trendDirection: 'stable',
      }
    }

    const sorted = logs.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )

    const dataPoints = sorted.map((l) => ({
      date: l.createdAt,
      weight: l.weight,
    }))

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

    return {
      dataPoints,
      avgChangePerWeek,
      trendDirection,
    }
  }
}
