import { beforeEach, describe, expect, it } from 'vitest'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { UpdateWeightGoalUseCase } from './update-weight-goal.use-case'

describe('UpdateWeightGoalUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: UpdateWeightGoalUseCase
  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.goals.push(makeWeightGoal())
    sut = new UpdateWeightGoalUseCase(unitOfWork)
  })
  it('preserves omitted fields while allowing explicit null to clear nullable fields', async () => {
    await sut.execute({
      goalId: 'goal-1',
      userId: 'user-1',
      description: null,
      endDate: null,
    })
    expect(unitOfWork.goals[0]?.name).toBe('Goal')
    expect(unitOfWork.goals[0]?.description).toBeNull()
    expect(unitOfWork.goals[0]?.endDate).toBeNull()
  })
  it('rejects an end date earlier than the latest goal measurement', async () => {
    unitOfWork.logs.push({
      id: 'log',
      userId: 'user-1',
      goalId: 'goal-1',
      weight: 75,
      note: null,
      date: new Date('2025-03-01'),
      createdAt: new Date(),
    })
    await expect(
      sut.execute({
        goalId: 'goal-1',
        userId: 'user-1',
        endDate: new Date('2025-02-01'),
      })
    ).rejects.toBeInstanceOf(InvalidWeightGoalError)
  })
})
