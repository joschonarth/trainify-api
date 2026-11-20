import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedDayDifference } from '@/shared/utils/date-timezone'
import type {
  StreakRepositories,
  StreakUnitOfWork,
} from '../repositories/streak-unit-of-work'
import type { UserStreaksRepository } from '../repositories/user-streaks.repository'
import {
  activityBusinessDate,
  activityDate,
} from '../utils/activity-business-day'
import { getEffectiveStreak } from '../utils/get-effective-streak'
import { rebuildStreak } from '../utils/rebuild-streak'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface UpdateUserStreakUseCaseRequest {
  userId: string
  logDate: Date
  recoverOriginalCompletion?: boolean
  creditDay?: { businessDate: string; timezone: string }
}

interface UpdateUserStreakUseCaseResponse {
  currentStreak: number
  bestStreak: number
  lastWorkout: Date | null
}

function toResponse(
  streak: Awaited<ReturnType<UserStreaksRepository['findByUserId']>>
): UpdateUserStreakUseCaseResponse {
  return streak
    ? {
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
        lastWorkout: streak.lastWorkout,
      }
    : { currentStreak: 0, bestStreak: 0, lastWorkout: null }
}

export class UpdateUserStreakUseCase {
  constructor(private readonly unitOfWork: StreakUnitOfWork) {}

  private resolveEventDay(
    creditDay: UpdateUserStreakUseCaseRequest['creditDay'],
    streak: Awaited<ReturnType<UserStreaksRepository['findByUserId']>>,
    logDate: Date,
    timezone: string
  ) {
    if (creditDay) {
      return creditDay
    }
    if (!streak?.lastBusinessDate) {
      return undefined
    }
    return {
      businessDate: dayjs(logDate).tz(timezone).format('YYYY-MM-DD'),
      timezone,
    }
  }

  private async creditBusinessDay(
    {
      userId,
      eventDay,
      timezone,
      streak,
    }: {
      userId: string
      eventDay: { businessDate: string; timezone: string }
      timezone: string
      streak: Awaited<ReturnType<UserStreaksRepository['findByUserId']>>
    },
    { logs, streaks }: Pick<StreakRepositories, 'logs' | 'streaks'>
  ) {
    const activity = await logs.findAllByUser(userId)
    const existing = activity.find(
      (log) =>
        activityBusinessDate(log, eventDay.timezone) === eventDay.businessDate
    )
    if (!existing) {
      const created = await logs.create({
        userId,
        date: dayjs.utc(eventDay.businessDate).toDate(),
        businessDate: eventDay.businessDate,
      })
      activity.push(created)
    } else if (!existing.businessDate) {
      await logs.assignBusinessDate(existing.id, eventDay.businessDate)
      existing.businessDate = eventDay.businessDate
    }
    const rebuilt = rebuildStreak(
      activity.map((log) => activityDate(log, timezone)),
      timezone,
      new Date(),
      streak?.bestStreak ?? 0
    )
    const keys = activity
      .map((log) => activityBusinessDate(log, timezone))
      .sort()
    const data = { ...rebuilt, lastBusinessDate: keys.at(-1) ?? null }
    if (streak) {
      await streaks.update(streak.id, data)
    } else {
      await streaks.create({ user: { connect: { id: userId } }, ...data })
    }
    return rebuilt
  }

  async execute({
    userId,
    logDate,
    recoverOriginalCompletion = false,
    creditDay,
  }: UpdateUserStreakUseCaseRequest): Promise<UpdateUserStreakUseCaseResponse> {
    return await this.unitOfWork.execute(
      userId,
      async ({ users, streaks, logs }) => {
        const user = await users.findById(userId)
        if (!user) {
          throw new ResourceNotFoundError('User not found.')
        }

        const initialStreak = await streaks.findByUserId(userId)
        const eventDay = this.resolveEventDay(
          creditDay,
          initialStreak,
          logDate,
          user.timezone
        )
        const streak = initialStreak
        if (eventDay) {
          return await this.creditBusinessDay(
            { userId, eventDay, timezone: user.timezone, streak },
            { logs, streaks }
          )
        }

        const timezone = user.timezone
        const normalizedDate = dayjs(logDate)
          .tz(timezone)
          .startOf('day')
          .toDate()

        const existingLog = await logs.findByUserAndDate(
          userId,
          normalizedDate,
          timezone
        )
        if (existingLog) {
          const summary = toResponse(streak)
          return {
            ...summary,
            currentStreak: getEffectiveStreak(
              summary.currentStreak,
              summary.lastWorkout,
              normalizedDate,
              timezone
            ),
          }
        }
        await logs.create({ userId, date: normalizedDate })

        if (!streak) {
          const initialStreak = 1
          const created = await streaks.create({
            user: { connect: { id: userId } },
            currentStreak: initialStreak,
            bestStreak: initialStreak,
            lastWorkout: normalizedDate,
          })

          return {
            currentStreak: created.currentStreak,
            bestStreak: created.bestStreak,
            lastWorkout: created.lastWorkout,
          }
        }

        const diffInDays = getZonedDayDifference(
          new Date(streak.lastWorkout ?? normalizedDate),
          normalizedDate,
          timezone
        )

        // A delayed reward retry may recover a completion older than newer credited activity.
        if (recoverOriginalCompletion && diffInDays < 0) {
          const activity = await logs.findAllByUser(userId)
          const rebuilt = rebuildStreak(
            activity.map((log) => activityDate(log, timezone)),
            timezone,
            new Date(),
            streak.bestStreak
          )
          const updated = await streaks.update(streak.id, rebuilt)
          return toResponse(updated)
        }

        let current = getEffectiveStreak(
          streak.currentStreak,
          streak.lastWorkout,
          normalizedDate,
          timezone
        )
        let best = streak.bestStreak
        if (!streak.lastWorkout || diffInDays > 1) {
          current = 1
        } else if (diffInDays === 1) {
          current += 1
        }

        if (current > best) {
          best = current
        }

        const updated = await streaks.update(streak.id, {
          currentStreak: current,
          bestStreak: best,
          lastWorkout: normalizedDate,
        })

        return {
          currentStreak: updated.currentStreak,
          bestStreak: updated.bestStreak,
          lastWorkout: updated.lastWorkout,
        }
      }
    )
  }
}
