import dayjs from 'dayjs'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedDayDifference } from '@/shared/utils/date-timezone'
import type { StreakUnitOfWork } from '../repositories/streak-unit-of-work'
import { getEffectiveStreak } from '../utils/get-effective-streak'

interface RefreshUserStreakUseCaseRequest {
  userId: string
}

interface RefreshUserStreakUseCaseResponse {
  currentStreak: number
  bestStreak: number
  lastWorkout: Date | null
}

export class RefreshUserStreakUseCase {
  constructor(private readonly unitOfWork: StreakUnitOfWork) {}

  async execute({
    userId,
  }: RefreshUserStreakUseCaseRequest): Promise<RefreshUserStreakUseCaseResponse> {
    return await this.unitOfWork.execute(
      userId,
      async ({ users, streaks, logs }) => {
        const user = await users.findById(userId)
        if (!user) {
          throw new ResourceNotFoundError('User not found.')
        }
        const streak = await streaks.findByUserId(userId)
        const activity = await logs.findAllByUser(userId)
        const dates = activity
          .map((log) => log.date)
          .sort((a, b) => a.getTime() - b.getTime())
        let lastWorkout: Date | null = null
        let current = 0
        let best = streak?.bestStreak ?? 0
        for (const date of dates) {
          const difference = lastWorkout
            ? getZonedDayDifference(lastWorkout, date, user.timezone)
            : null
          if (difference === 0) {
            continue
          }
          current = difference === 1 ? current + 1 : 1
          best = Math.max(best, current)
          lastWorkout = dayjs(date).tz(user.timezone).startOf('day').toDate()
        }
        const response = {
          currentStreak: getEffectiveStreak(
            current,
            lastWorkout,
            new Date(),
            user.timezone
          ),
          bestStreak: best,
          lastWorkout,
        }
        if (streak) {
          await streaks.update(streak.id, response)
        } else {
          await streaks.create({
            user: { connect: { id: userId } },
            ...response,
          })
        }
        return response
      }
    )
  }
}
