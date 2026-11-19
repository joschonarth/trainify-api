import { PrismaMetricsRepository } from '@/modules/metric/repositories/prisma/prisma-metrics.repository'

import { GetUserMetricsUseCase } from '../get-user-metrics.use-case'

export function makeGetUserMetricsUseCase() {
  const metricsRepository = new PrismaMetricsRepository()
  const getUserMetricsUseCase = new GetUserMetricsUseCase(metricsRepository)

  return getUserMetricsUseCase
}
