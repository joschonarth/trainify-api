import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedDayDifference } from '@/shared/utils/date-timezone'
import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import type { UserStreaksRepository } from '../repositories/user-streaks.repository'
import { getEffectiveStreak } from '../utils/get-effective-streak'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface UpdateUserStreakUseCaseRequest {
  userId: string
  logDate: Date
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
  constructor(
    private readonly userStreaksRepository: UserStreaksRepository,
    private readonly userStreakLogsRepository: UserStreakLogsRepository,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute({
    userId,
    logDate,
  }: UpdateUserStreakUseCaseRequest): Promise<UpdateUserStreakUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const timezone = user.timezone
    const normalizedDate = dayjs(logDate).tz(timezone).startOf('day').toDate()

    const streak = await this.userStreaksRepository.findByUserId(userId)

    const existingLog = await this.userStreakLogsRepository.findByUserAndDate(
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
    await this.userStreakLogsRepository.create({ userId, date: normalizedDate })

    if (!streak) {
      const initialStreak = 1
      const created = await this.userStreaksRepository.create({
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

    const updated = await this.userStreaksRepository.update(streak.id, {
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
}
