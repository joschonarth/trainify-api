import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'

describe('CalculateWeightGoalProgressUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: CalculateWeightGoalProgressUseCase

  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    sut = new CalculateWeightGoalProgressUseCase(unitOfWork)
  })

  it('calculates progress from the latest log belonging to the goal', async () => {
    unitOfWork.goals.push(makeWeightGoal())
    unitOfWork.logs.push(
      makeWeightLog({ weight: 75 }),
      makeWeightLog({ id: 'other', goalId: 'other-goal', weight: 60 })
    )
    const result = await sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    expect(result.progress).toBe(50)
    expect(result.achieved).toBe(false)
  })

  it('clamps legacy equal-target goals to finite progress', async () => {
    unitOfWork.goals.push(makeWeightGoal({ startWeight: 70, targetWeight: 70 }))
    unitOfWork.logs.push(makeWeightLog({ weight: 70 }))
    const result = await sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    expect(result.progress).toBe(100)
    expect(Number.isFinite(result.progress)).toBe(true)
    expect(result.achieved).toBe(true)
  })

  it('writes zero progress when no measurements exist', async () => {
    unitOfWork.goals.push(makeWeightGoal())
    await expect(
      sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    ).resolves.toMatchObject({ progress: 0, achieved: false })
  })
})
