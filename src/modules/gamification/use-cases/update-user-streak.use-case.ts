import { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import { UserStreaksRepository } from '../repositories/user-streaks.repository'
import { daysBetweenDates } from '../utils/get-days-between-dates'

interface UpdateUserStreakUseCaseRequest {
  userId: string
  logDate: Date
  isRefresh?: boolean
}

interface UpdateUserStreakUseCaseResponse {
  currentStreak: number
  bestStreak: number
  lastWorkout: Date | null
}

export class UpdateUserStreakUseCase {
  constructor(
    private userStreaksRepository: UserStreaksRepository,
    private userStreakLogsRepository: UserStreakLogsRepository,
  ) {}

  async execute({
    userId,
    logDate,
    isRefresh = false,
  }: UpdateUserStreakUseCaseRequest): Promise<UpdateUserStreakUseCaseResponse> {
    const normalizedDate = new Date(logDate.setHours(0, 0, 0, 0))

    const streak = await this.userStreaksRepository.findByUserId(userId)

    if (!isRefresh) {
      const existingLog = await this.userStreakLogsRepository.findByUserAndDate(
        userId,
        normalizedDate,
      )
      if (existingLog) {
        return streak
          ? {
              currentStreak: streak.currentStreak,
              bestStreak: streak.bestStreak,
              lastWorkout: streak.lastWorkout,
            }
          : { currentStreak: 0, bestStreak: 0, lastWorkout: null }
      }

      await this.userStreakLogsRepository.create({
        userId,
        date: normalizedDate,
      })
    }

    if (!streak) {
      const initialStreak = isRefresh ? 0 : 1
      const created = await this.userStreaksRepository.create({
        user: { connect: { id: userId } },
        currentStreak: initialStreak,
        bestStreak: initialStreak,
        lastWorkout: isRefresh ? null : normalizedDate,
      })

      return {
        currentStreak: created.currentStreak,
        bestStreak: created.bestStreak,
        lastWorkout: created.lastWorkout,
      }
    }

    const diffInDays = daysBetweenDates(
      new Date(streak.lastWorkout ?? normalizedDate),
      normalizedDate,
    )

    let current = streak.currentStreak
    let best = streak.bestStreak

    if (diffInDays > 1) current = 0

    if (!isRefresh) {
      if (diffInDays === 1) current += 1
      else if (diffInDays > 1) current = 1
    }

    if (current > best) best = current

    const updated = await this.userStreaksRepository.update(streak.id, {
      currentStreak: current,
      bestStreak: best,
      lastWorkout: isRefresh ? streak.lastWorkout : normalizedDate,
    })

    return {
      currentStreak: updated.currentStreak,
      bestStreak: updated.bestStreak,
      lastWorkout: updated.lastWorkout,
    }
  }
}
