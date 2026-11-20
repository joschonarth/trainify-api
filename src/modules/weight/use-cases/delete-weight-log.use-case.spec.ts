import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { makeWeightUser } from '../tests/factories/make-weight-user'
import { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'
import { DeleteWeightLogUseCase } from './delete-weight-log.use-case'

describe('DeleteWeightLogUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: DeleteWeightLogUseCase
  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.users.push(makeWeightUser())
    unitOfWork.goals.push(makeWeightGoal())
    unitOfWork.logs.push(makeWeightLog())
    sut = new DeleteWeightLogUseCase(
      unitOfWork,
      new CalculateWeightGoalProgressUseCase(unitOfWork)
    )
  })
  it('removes the record and recalculates profile weight and goal progress', async () => {
    await sut.execute({ logId: 'log-1', userId: 'user-1' })
    expect(unitOfWork.logs).toHaveLength(0)
    expect(unitOfWork.users[0]?.weight).toBe(80)
    expect(unitOfWork.goals[0]?.progress).toBe(0)
  })
  it('does not reveal whether a foreign log exists', async () => {
    await expect(
      sut.execute({ logId: 'log-1', userId: 'other' })
    ).rejects.toThrow('Weight log not found')
  })
})
