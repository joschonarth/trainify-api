import { describe, expect, it } from 'vitest'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { DeactivateWeightGoalUseCase } from './deactivate-weight-goal.use-case'

describe('DeactivateWeightGoalUseCase', () => {
  it('deactivates an owned active goal and treats repeated deactivation as idempotent', async () => {
    const unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.goals.push(makeWeightGoal())
    const sut = new DeactivateWeightGoalUseCase(unitOfWork.repositories.goals)
    await sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    await sut.execute({ goalId: 'goal-1', userId: 'user-1' })
    expect(unitOfWork.goals[0]?.isActive).toBe(false)
  })
})
