import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedDayDifference } from '@/shared/utils/date-timezone'
import type { StreakUnitOfWork } from '../repositories/streak-unit-of-work'
import type { UserStreaksRepository } from '../repositories/user-streaks.repository'
import { getEffectiveStreak } from '../utils/get-effective-streak'
import { rebuildStreak } from '../utils/rebuild-streak'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface UpdateUserStreakUseCaseRequest {
  userId: string
  logDate: Date
  recoverOriginalCompletion?: boolean
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

  async execute({
    userId,
    logDate,
    recoverOriginalCompletion = false,
  }: UpdateUserStreakUseCaseRequest): Promise<UpdateUserStreakUseCaseResponse> {
    return await this.unitOfWork.execute(
      userId,
      async ({ users, streaks, logs }) => {
        const user = await users.findById(userId)
        if (!user) {
          throw new ResourceNotFoundError('User not found.')
        }

        const timezone = user.timezone
        const normalizedDate = dayjs(logDate)
          .tz(timezone)
          .startOf('day')
          .toDate()

        const streak = await streaks.findByUserId(userId)

        const existingLog = await logs.findByUserAndDate(
          userId,
          normalizedDate,
          timezone
        )
        if (existingLog) {
          return {
            ...toResponse(streak),
            currentStreak: getEffectiveStreak(
              streak?.currentStreak ?? 0,
              streak?.lastWorkout ?? null,
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
            activity.map((log) => log.date),
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
