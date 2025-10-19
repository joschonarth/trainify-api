import { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import { UserStreaksRepository } from '../repositories/user-streaks.repository'
import { daysBetweenDates } from '../utils/get-days-between-dates'

interface UpdateUserStreakRequest {
  userId: string
  logDate: Date
}

export class UpdateUserStreakUseCase {
  constructor(
    private userStreaksRepository: UserStreaksRepository,
    private userStreakLogsRepository: UserStreakLogsRepository,
  ) {}

  async execute({ userId, logDate }: UpdateUserStreakRequest) {
    const normalizedDate = new Date(logDate.setHours(0, 0, 0, 0))

    const existingLog = await this.userStreakLogsRepository.findByUserAndDate(
      userId,
      normalizedDate,
    )

    if (existingLog) return

    await this.userStreakLogsRepository.create({
      userId,
      date: normalizedDate,
    })

    const streak = await this.userStreaksRepository.findByUserId(userId)

    if (!streak) {
      await this.userStreaksRepository.create({
        user: { connect: { id: userId } },
        currentStreak: 1,
        bestStreak: 1,
        lastWorkout: normalizedDate,
      })
      return
    }

    const diffInDays = daysBetweenDates(
      new Date(streak.lastWorkout ?? normalizedDate),
      normalizedDate,
    )

    let current = streak.currentStreak
    let best = streak.bestStreak

    if (diffInDays === 1) current += 1
    else if (diffInDays > 1) current = 1

    if (current > best) best = current

    await this.userStreaksRepository.update(streak.id, {
      currentStreak: current,
      bestStreak: best,
      lastWorkout: normalizedDate,
    })
  }
}
