import { beforeEach, describe, expect, it } from 'vitest'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { makeWeightUser } from '../tests/factories/make-weight-user'
import { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'
import { UpdateWeightLogUseCase } from './update-weight-log.use-case'

describe('UpdateWeightLogUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: UpdateWeightLogUseCase

  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.users.push(makeWeightUser())
    unitOfWork.goals.push(makeWeightGoal())
    unitOfWork.logs.push(makeWeightLog())
    sut = new UpdateWeightLogUseCase(
      unitOfWork,
      new CalculateWeightGoalProgressUseCase(unitOfWork)
    )
  })

  it('distinguishes omitted values from explicit null when updating a log', async () => {
    await sut.execute({ logId: 'log-1', userId: 'user-1', note: null })
    expect(unitOfWork.logs[0]?.weight).toBe(75)
    expect(unitOfWork.logs[0]?.note).toBeNull()
  })

  it('recalculates profile weight from the latest dated log after correcting a measurement', async () => {
    unitOfWork.logs.push(
      makeWeightLog({ id: 'latest', date: new Date('2025-02-01'), weight: 73 })
    )
    await sut.execute({
      logId: 'latest',
      userId: 'user-1',
      date: new Date('2025-01-01'),
      weight: 74,
    })
    expect(unitOfWork.users[0]?.weight).toBe(75)
  })

  it('rejects invalid weights and foreign records', async () => {
    await expect(
      sut.execute({ logId: 'log-1', userId: 'user-1', weight: Number.NaN })
    ).rejects.toBeInstanceOf(InvalidWeightGoalError)
    await expect(
      sut.execute({ logId: 'log-1', userId: 'user-2' })
    ).rejects.toThrow('Weight log not found')
  })
})
