import { describe, expect, it } from 'vitest'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { GetWeightSummaryUseCase } from './get-weight-summary.use-case'

describe('GetWeightSummaryUseCase', () => {
  it('summarizes measurements using business dates and errors for empty history', async () => {
    const unitOfWork = new InMemoryWeightUnitOfWork()
    const sut = new GetWeightSummaryUseCase(unitOfWork.repositories.logs)
    await expect(sut.execute('user-1')).rejects.toThrow('No weight logs found')
    unitOfWork.logs.push(
      makeWeightLog({ weight: 80, date: new Date('2025-01-01') }),
      makeWeightLog({ id: 'later', weight: 76, date: new Date('2025-02-01') })
    )
    await expect(sut.execute('user-1')).resolves.toMatchObject({
      currentWeight: 76,
      startWeight: 80,
      variation: -4,
      minWeight: 76,
      maxWeight: 80,
      lastLogDate: new Date('2025-02-01'),
    })
  })
})
