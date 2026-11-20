import { describe, expect, it } from 'vitest'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { GetGeneralWeightAnalyticsUseCase } from './get-general-weight-analytics.use-case'

describe('GetGeneralWeightAnalyticsUseCase', () => {
  it('returns stable zero analytics for empty and single-measurement histories', async () => {
    const unitOfWork = new InMemoryWeightUnitOfWork()
    const sut = new GetGeneralWeightAnalyticsUseCase(
      unitOfWork.repositories.logs
    )
    await expect(sut.execute({ userId: 'user-1' })).resolves.toMatchObject({
      avgChangePerWeek: 0,
      trendDirection: 'stable',
      dataPoints: [],
    })
    unitOfWork.logs.push(makeWeightLog())
    const result = await sut.execute({ userId: 'user-1' })
    expect(result.avgChangePerWeek).toBe(0)
    expect(result.trendDirection).toBe('stable')
  })

  it('passes inclusive date filters to the log query', async () => {
    const unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.logs.push(
      makeWeightLog({ date: new Date('2025-01-01') }),
      makeWeightLog({ id: 'later', date: new Date('2025-01-02') })
    )
    const result = await new GetGeneralWeightAnalyticsUseCase(
      unitOfWork.repositories.logs
    ).execute({
      userId: 'user-1',
      from: new Date('2025-01-01'),
      to: new Date('2025-01-01'),
    })
    expect(result.dataPoints).toHaveLength(1)
  })
})
