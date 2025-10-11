import { UserStreaksRepository } from '@/repositories/user-streaks.repository'
import { daysBetweenDates } from '@/utils/get-days-between-dates'

interface GetUserStreakUseCaseResponse {
  currentStreak: number
  bestStreak: number
  lastWorkout: Date | null
}

export class GetUserStreakUseCase {
  constructor(private userStreaksRepository: UserStreaksRepository) {}

  async execute(userId: string): Promise<GetUserStreakUseCaseResponse> {
    const streak = await this.userStreaksRepository.findByUserId(userId)

    if (!streak) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        lastWorkout: null,
      }
    }

    if (!streak.lastWorkout) {
      return {
        currentStreak: streak.currentStreak ?? 0,
        bestStreak: streak.bestStreak ?? 0,
        lastWorkout: null,
      }
    }

    const lastWorkoutDate = new Date(streak.lastWorkout)
    const now = new Date()

    const diffInDays = daysBetweenDates(lastWorkoutDate, now)

    if (diffInDays > 1 && (streak.currentStreak ?? 0) > 0) {
      await this.userStreaksRepository.update(streak.id, {
        currentStreak: 0,
      })

      return {
        currentStreak: 0,
        bestStreak: streak.bestStreak ?? 0,
        lastWorkout: streak.lastWorkout,
      }
    }

    return {
      currentStreak: streak.currentStreak ?? 0,
      bestStreak: streak.bestStreak ?? 0,
      lastWorkout: streak.lastWorkout,
    }
  }
}
