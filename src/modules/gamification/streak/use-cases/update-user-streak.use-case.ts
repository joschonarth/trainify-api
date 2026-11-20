import dayjs from 'dayjs'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  StreakRepositories,
  StreakUnitOfWork,
} from '../repositories/streak-unit-of-work'
import { activityBusinessDate } from '../utils/activity-business-day'
import { evaluateTracking } from '../utils/evaluate-tracking'

interface UpdateUserStreakUseCaseRequest {
  userId: string
  logDate: Date
  creditDay?: { businessDate: string; timezone: string }
}

export class UpdateUserStreakUseCase {
  constructor(private readonly unitOfWork: StreakUnitOfWork) {}

  private async creditPlannedDay(
    { userId, logDate, creditDay }: UpdateUserStreakUseCaseRequest,
    timezone: string,
    {
      plans,
      logs,
      streaks,
    }: Pick<StreakRepositories, 'plans' | 'logs' | 'streaks'>
  ) {
    const plan = await plans.findByUser(userId)
    const businessDate =
      creditDay?.businessDate ??
      dayjs(logDate)
        .tz(plan?.timezone ?? timezone)
        .format('YYYY-MM-DD')
    const existing = (await logs.findAllByUser(userId)).find(
      (log) =>
        activityBusinessDate(log, plan?.timezone ?? timezone) === businessDate
    )
    if (!existing) {
      await logs.create({
        userId,
        date: dayjs.utc(businessDate).toDate(),
        businessDate,
      })
    }
    const activity = await logs.findAllByUser(userId)
    const result = evaluateTracking(
      plan,
      activity.map((log) =>
        activityBusinessDate(log, plan?.timezone ?? timezone)
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

  async execute(request: UpdateUserStreakUseCaseRequest) {
    return await this.unitOfWork.execute(
      request.userId,
      async (repositories) => {
        const user = await repositories.users.findById(request.userId)
        if (!user) {
          throw new ResourceNotFoundError('User not found.')
        }
        return this.creditPlannedDay(request, user.timezone, repositories)
      }
    )
  }
}
