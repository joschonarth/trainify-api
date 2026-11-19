import type { MetricsRepository } from '../repositories/metrics.repository'

interface GetUserMetricsRequest {
  userId: string
}

interface GetUserMetricsResponse {
  totalWorkouts: number
  totalExercises: number
  totalWorkoutDuration: number
}

export class GetUserMetricsUseCase {
  constructor(private readonly metricsRepository: MetricsRepository) {}

  async execute({
    userId,
  }: GetUserMetricsRequest): Promise<GetUserMetricsResponse> {
    return await this.metricsRepository.getUserMetrics(userId)
  }
}
