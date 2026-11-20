import dayjs from 'dayjs'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedDayDifference } from '@/shared/utils/date-timezone'
import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import type { UserStreaksRepository } from '../repositories/user-streaks.repository'
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
  constructor(
    private readonly userStreaksRepository: UserStreaksRepository,
    private readonly userStreakLogsRepository: Pick<
      UserStreakLogsRepository,
      'findAllByUser'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute({
    userId,
  }: RefreshUserStreakUseCaseRequest): Promise<RefreshUserStreakUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }
    const streak = await this.userStreaksRepository.findByUserId(userId)
    const logs = await this.userStreakLogsRepository.findAllByUser(userId)
    const dates = logs
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
      await this.userStreaksRepository.update(streak.id, response)
    } else {
      await this.userStreaksRepository.create({
        user: { connect: { id: userId } },
        ...response,
      })
    }
    return response
  }
}
