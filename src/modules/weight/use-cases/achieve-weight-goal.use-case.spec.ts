import { beforeEach, describe, expect, it } from 'vitest'

import { WeightGoalNotAchievedError } from '../errors/weight-goal-not-achieved.error'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { AchieveWeightGoalUseCase } from './achieve-weight-goal.use-case'

describe('AchieveWeightGoalUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: AchieveWeightGoalUseCase

  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    sut = new AchieveWeightGoalUseCase(unitOfWork)
  })

  it('achieves a goal only with a sufficient number of goal-scoped logs', async () => {
    unitOfWork.goals.push(makeWeightGoal())
    unitOfWork.logs.push(makeWeightLog({ weight: 69 }))
    const result = await sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    expect(result.progress).toBe(100)
    expect(unitOfWork.goals[0]?.isActive).toBe(false)
  })

  it('requires two measurements to achieve a maintenance goal', async () => {
    unitOfWork.goals.push(
      makeWeightGoal({
        goalType: 'MAINTAIN',
        startWeight: 80,
        targetWeight: 80,
      })
    )
    unitOfWork.logs.push(makeWeightLog({ weight: 80 }))
    await expect(
      sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    ).rejects.toBeInstanceOf(WeightGoalNotAchievedError)
  })

  it('returns an already achieved goal idempotently', async () => {
    unitOfWork.goals.push(
      makeWeightGoal({ achievedAt: new Date(), isActive: false })
    )
    await expect(
      sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    ).resolves.toMatchObject({ progress: 100 })
  })
})
