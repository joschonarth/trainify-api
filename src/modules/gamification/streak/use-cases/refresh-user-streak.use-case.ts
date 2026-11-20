import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { StreakUnitOfWork } from '../repositories/streak-unit-of-work'
import { rebuildStreak } from '../utils/rebuild-streak'

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
        const response = rebuildStreak(
          activity.map((log) => log.date),
          user.timezone,
          new Date(),
          streak?.bestStreak ?? 0
        )
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
