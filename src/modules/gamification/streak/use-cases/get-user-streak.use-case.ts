import type { UserStreaksRepository } from '@/modules/gamification/streak/repositories/user-streaks.repository'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getEffectiveStreak } from '../utils/get-effective-streak'

interface GetUserStreakUseCaseResponse {
  currentStreak: number
  bestStreak: number
  lastWorkout: Date | null
}

export class GetUserStreakUseCase {
  constructor(
    private readonly userStreaksRepository: Pick<
      UserStreaksRepository,
      'findByUserId'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute(userId: string): Promise<GetUserStreakUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }
    const streak = await this.userStreaksRepository.findByUserId(userId)
    return {
      currentStreak: getEffectiveStreak(
        streak?.currentStreak ?? 0,
        streak?.lastWorkout ?? null,
        new Date(),
        user.timezone
      ),
      bestStreak: streak?.bestStreak ?? 0,
      lastWorkout: streak?.lastWorkout ?? null,
    }
  }
}
