import { UserStreaksRepository } from '@/repositories/user-streaks.repository'

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

    return {
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      lastWorkout: streak.lastWorkout,
    }
  }
}
