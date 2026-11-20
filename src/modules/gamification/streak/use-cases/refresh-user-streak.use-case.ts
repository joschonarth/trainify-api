import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { StreakUnitOfWork } from '../repositories/streak-unit-of-work'
import { activityBusinessDate } from '../utils/activity-business-day'
import { evaluateTracking } from '../utils/evaluate-tracking'

export class RefreshUserStreakUseCase {
  constructor(private readonly unitOfWork: StreakUnitOfWork) {}
  async execute({ userId }: { userId: string }) {
    return await this.unitOfWork.execute(
      userId,
      async ({ users, plans, logs, streaks }) => {
        const user = await users.findById(userId)
        if (!user) {
          throw new ResourceNotFoundError('User not found.')
        }
        const plan = await plans.findByUser(userId)
        const activity = await logs.findAllByUser(userId)
        const result = evaluateTracking(
          plan,
          activity.map((log) =>
            activityBusinessDate(log, plan?.timezone ?? user.timezone)
          )
        )
        if (!plan) {
          return result
        }
        const previous = await streaks.findByUserId(userId)
        const data = {
          currentStreak: result.currentStreak,
          bestStreak: result.bestStreak,
          lastWorkout: result.lastWorkout,
          lastBusinessDate: result.lastBusinessDate,
        }
        if (previous) {
          await streaks.update(previous.id, data)
        } else {
          await streaks.create({ user: { connect: { id: userId } }, ...data })
        }
        return result
      }
    )
  }
}
