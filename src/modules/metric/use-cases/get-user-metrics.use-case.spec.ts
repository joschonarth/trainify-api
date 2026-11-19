import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MetricsRepository } from '@/modules/metric/repositories/metrics.repository'

import { GetUserMetricsUseCase } from './get-user-metrics.use-case'

describe('GetUserMetricsUseCase', () => {
  let metricsRepository: MetricsRepository
  let sut: GetUserMetricsUseCase

  beforeEach(() => {
    metricsRepository = {
      getUserMetrics: vi.fn(async () => ({
        totalWorkouts: 4,
        totalExercises: 7,
        totalWorkoutDuration: 3600,
      })),
    }
    sut = new GetUserMetricsUseCase(metricsRepository)
  })

  it('returns the user metrics from the metrics repository', async () => {
    await expect(sut.execute({ userId: 'user-id' })).resolves.toEqual({
      totalWorkouts: 4,
      totalExercises: 7,
      totalWorkoutDuration: 3600,
    })

    expect(metricsRepository.getUserMetrics).toHaveBeenCalledWith('user-id')
  })

  it('returns zero metrics when the user has no activity', async () => {
    vi.mocked(metricsRepository.getUserMetrics).mockResolvedValue({
      totalWorkouts: 0,
      totalExercises: 0,
      totalWorkoutDuration: 0,
    })

    await expect(sut.execute({ userId: 'new-user-id' })).resolves.toEqual({
      totalWorkouts: 0,
      totalExercises: 0,
      totalWorkoutDuration: 0,
    })
  })
})
