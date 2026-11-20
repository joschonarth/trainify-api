import { beforeEach, describe, expect, it } from 'vitest'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { makeWeightUser } from '../tests/factories/make-weight-user'
import { CreateWeightGoalUseCase } from './create-weight-goal.use-case'

describe('CreateWeightGoalUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: CreateWeightGoalUseCase

  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.users.push(makeWeightUser())
    sut = new CreateWeightGoalUseCase(unitOfWork)
  })

  it('uses the latest measurement on or before the start date as the starting weight', async () => {
    unitOfWork.logs.push(
      makeWeightLog({ weight: 77, date: new Date('2024-12-01') })
    )
    unitOfWork.logs.push(
      makeWeightLog({ id: 'future', weight: 60, date: new Date('2025-02-01') })
    )
    const result = await sut.execute({
      userId: 'user-1',
      name: 'Lose weight',
      goalType: 'LOSE',
      targetWeight: 70,
      startDate: new Date('2025-01-01'),
    })
    expect(result.weightGoal.startWeight).toBe(77)
  })

  it('rejects a target that does not match the goal direction without deactivating the current goal', async () => {
    unitOfWork.goals.push(makeWeightGoal())
    await expect(
      sut.execute({
        userId: 'user-1',
        name: 'Invalid',
        goalType: 'LOSE',
        targetWeight: 80,
      })
    ).rejects.toBeInstanceOf(InvalidWeightGoalError)
    expect(unitOfWork.goals[0]?.isActive).toBe(true)
  })

  it('rejects an end date before the start date', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        name: 'Invalid',
        goalType: 'MAINTAIN',
        targetWeight: 80,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-01-01'),
      })
    ).rejects.toBeInstanceOf(InvalidWeightGoalError)
  })

  it('deactivates the previous goal only after validating the new goal', async () => {
    unitOfWork.goals.push(makeWeightGoal())
    const result = await sut.execute({
      userId: 'user-1',
      name: 'Gain weight',
      goalType: 'GAIN',
      targetWeight: 90,
    })
    expect(unitOfWork.goals[0]?.isActive).toBe(false)
    expect(result.weightGoal.isActive).toBe(true)
  })
})
