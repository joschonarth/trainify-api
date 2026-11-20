import type { WeightLog } from 'generated/prisma'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import type {
  WeightRepositories,
  WeightUnitOfWork,
} from '../repositories/weight-unit-of-work'
import { syncUserWeightFromLatestLog } from '../utils/sync-user-weight-from-latest-log'
import type { CalculateWeightGoalProgressUseCase } from './calculate-weight-goal-progress.use-case'

async function getGoalForLogging(
  userId: string,
  goalId: string | null | undefined,
  weight: number,
  repositories: WeightRepositories
) {
  const goal = goalId
    ? await repositories.goals.findById(goalId)
    : await repositories.goals.findActiveGoalByUserId(userId)

  if (goalId && (!goal || goal.userId !== userId)) {
    throw new ResourceNotFoundError('Weight goal not found.')
  }

  if (!goal) {
    return null
  }

  if (!goal.isActive) {
    throw new InvalidWeightGoalError(
      'Cannot log weight for an inactive or already achieved goal.'
    )
  }

  const startWeight = goal.startWeight ?? weight
  if (
    !Number.isFinite(goal.targetWeight) ||
    goal.targetWeight <= 0 ||
    !Number.isFinite(startWeight) ||
    startWeight <= 0 ||
    (goal.goalType === 'LOSE' && goal.targetWeight >= startWeight) ||
    (goal.goalType === 'GAIN' && goal.targetWeight <= startWeight)
  ) {
    throw new InvalidWeightGoalError('Invalid weight goal data.')
  }

  return goal
}

function validateLog(weight: number, date?: Date) {
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new InvalidWeightGoalError('Weight must be a positive finite number.')
  }

  if (date && !Number.isFinite(date.getTime())) {
    throw new InvalidWeightGoalError('Log date must be valid.')
  }
}

interface CreateWeightLogUseCaseRequest {
  userId: string
  weight: number
  note?: string | null
  goalId?: string | null
  date?: Date
}

interface CreateWeightLogUseCaseResponse {
  weightLog: WeightLog
}

export class CreateWeightLogUseCase {
  constructor(
    private readonly weightUnitOfWork: WeightUnitOfWork,
    private readonly calculateWeightGoalProgressUseCase: CalculateWeightGoalProgressUseCase
  ) {}

  async execute({
    userId,
    weight,
    note,
    goalId,
    date,
  }: CreateWeightLogUseCaseRequest): Promise<CreateWeightLogUseCaseResponse> {
    validateLog(weight, date)

    return await this.weightUnitOfWork.execute(userId, async (repositories) => {
      let goal = await getGoalForLogging(userId, goalId, weight, repositories)

      const weightLog = await repositories.logs.create({
        userId,
        goalId: goal?.id ?? null,
        weight,
        note: note ?? null,
        ...(date ? { date } : {}),
      })

      await syncUserWeightFromLatestLog(
        userId,
        repositories.users,
        repositories.logs
      )

      if (goal && goal.startWeight === null) {
        goal = await repositories.goals.update(goal.id, { startWeight: weight })
      }

      if (goal) {
        await this.calculateWeightGoalProgressUseCase.executeInTransaction(
          goal.id,
          userId,
          repositories
        )
      }

      return { weightLog }
    })
  }
}
