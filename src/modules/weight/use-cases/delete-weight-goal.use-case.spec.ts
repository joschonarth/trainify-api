import { describe, expect, it } from 'vitest'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeWeightLog } from '../tests/factories/make-weight-log'
import { DeleteWeightGoalUseCase } from './delete-weight-goal.use-case'

describe('DeleteWeightGoalUseCase', () => {
  it('detaches associated logs before deleting the goal', async () => {
    const unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.goals.push(makeWeightGoal())
    unitOfWork.logs.push(makeWeightLog())
    await new DeleteWeightGoalUseCase(unitOfWork).execute({
      goalId: 'goal-1',
      userId: 'user-1',
    })
    expect(unitOfWork.goals).toHaveLength(0)
    expect(unitOfWork.logs[0]?.goalId).toBeNull()
  })
})
