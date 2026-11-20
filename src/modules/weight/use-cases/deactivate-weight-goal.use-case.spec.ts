import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryWeightUnitOfWork } from '../repositories/in-memory/in-memory-weight-unit-of-work'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { DeactivateWeightGoalUseCase } from './deactivate-weight-goal.use-case'

describe('DeactivateWeightGoalUseCase', () => {
  let unitOfWork: InMemoryWeightUnitOfWork
  let sut: DeactivateWeightGoalUseCase
  const request = { goalId: 'goal-1', userId: 'user-1' }

  beforeEach(() => {
    unitOfWork = new InMemoryWeightUnitOfWork()
    unitOfWork.goals.push(makeWeightGoal())
    sut = new DeactivateWeightGoalUseCase(unitOfWork)
  })

  it('deactivates an owned goal and makes repeated deactivation a no-op', async () => {
    const deactivate = vi.spyOn(unitOfWork.repositories.goals, 'deactivateGoal')
    await sut.execute(request)
    await sut.execute(request)
    expect(unitOfWork.goals[0]?.isActive).toBe(false)
    expect(deactivate).toHaveBeenCalledTimes(1)
  })

  it('reads ownership and status inside the transaction rather than using a stale snapshot', async () => {
    const find = vi.spyOn(unitOfWork.repositories.goals, 'findById')
    vi.spyOn(unitOfWork, 'execute').mockImplementationOnce(
      async (_id, operation) => {
        expect(find).not.toHaveBeenCalled()
        const goal = unitOfWork.goals[0]
        if (!goal) {
          throw new Error('Missing goal fixture')
        }
        goal.isActive = false
        return await operation(unitOfWork.repositories)
      }
    )
    const deactivate = vi.spyOn(unitOfWork.repositories.goals, 'deactivateGoal')
    await sut.execute(request)
    expect(unitOfWork.execute).toHaveBeenCalledWith(
      request.userId,
      expect.any(Function)
    )
    expect(deactivate).not.toHaveBeenCalled()
  })

  it.each([
    'missing',
    'foreign',
  ])('returns the same 404 for a %s goal without writes', async (kind) => {
    if (kind === 'missing') {
      unitOfWork.goals.length = 0
    } else {
      const goal = unitOfWork.goals[0]
      if (!goal) {
        throw new Error('Missing goal fixture')
      }
      goal.userId = 'another-user'
    }
    const deactivate = vi.spyOn(unitOfWork.repositories.goals, 'deactivateGoal')
    await expect(sut.execute(request)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Weight goal not found',
    })
    expect(deactivate).not.toHaveBeenCalled()
  })

  it('propagates persistence failure and permits a subsequent retry', async () => {
    vi.spyOn(
      unitOfWork.repositories.goals,
      'deactivateGoal'
    ).mockRejectedValueOnce(new Error('Persistence failed'))
    await expect(sut.execute(request)).rejects.toThrow('Persistence failed')
    expect(unitOfWork.goals[0]?.isActive).toBe(true)
    await sut.execute(request)
    expect(unitOfWork.goals[0]?.isActive).toBe(false)
  })
})
