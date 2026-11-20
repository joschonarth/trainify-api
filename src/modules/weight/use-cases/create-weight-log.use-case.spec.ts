import { beforeEach, describe, expect, it } from 'vitest'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeWeightUser } from '../tests/factories/make-weight-user'
import { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'
import { CreateWeightLogUseCase } from './create-weight-log.use-case'

describe('CreateWeightLogUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: CreateWeightLogUseCase

  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.users.push(makeWeightUser())
    sut = new CreateWeightLogUseCase(
      unitOfWork,
      new CalculateWeightGoalProgressUseCase(unitOfWork)
    )
  })

  it('stores a valid dated measurement, updates profile weight and recalculates progress', async () => {
    unitOfWork.goals.push(makeWeightGoal())
    const date = new Date('2025-02-01')
    const result = await sut.execute({ userId: 'user-1', weight: 69, date })
    expect(result.weightLog.date).toEqual(date)
    expect(unitOfWork.users[0]?.weight).toBe(69)
    expect(unitOfWork.goals[0]?.achievedAt).toBeInstanceOf(Date)
  })

  it('does not let a retroactive measurement replace the current profile weight', async () => {
    unitOfWork.logs.push({
      id: 'newest',
      userId: 'user-1',
      goalId: null,
      weight: 75,
      note: null,
      date: new Date('2025-02-01'),
      createdAt: new Date(),
    })
    await sut.execute({
      userId: 'user-1',
      weight: 79,
      date: new Date('2025-01-01'),
    })
    expect(unitOfWork.users[0]?.weight).toBe(75)
  })

  it('rejects non-positive weights before creating a log', async () => {
    await expect(
      sut.execute({ userId: 'user-1', weight: 0 })
    ).rejects.toBeInstanceOf(InvalidWeightGoalError)
    expect(unitOfWork.logs).toHaveLength(0)
  })

  it('hides missing and foreign goals behind the same not-found error', async () => {
    await expect(
      sut.execute({ userId: 'user-1', weight: 75, goalId: 'missing' })
    ).rejects.toThrow('Weight goal not found.')
    unitOfWork.goals.push(makeWeightGoal({ id: 'foreign', userId: 'user-2' }))
    await expect(
      sut.execute({ userId: 'user-1', weight: 75, goalId: 'foreign' })
    ).rejects.toThrow('Weight goal not found.')
  })
})
