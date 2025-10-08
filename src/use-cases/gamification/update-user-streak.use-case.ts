import { UserStreaksRepository } from '@/repositories/user-streaks.repository'

interface UpdateUserStreakUseCaseRequest {
  userId: string
  workoutDate: Date
}

export class UpdateUserStreakUseCase {
  constructor(private userStreaksRepository: UserStreaksRepository) {}

  async execute({
    userId,
    workoutDate,
  }: UpdateUserStreakUseCaseRequest): Promise<void> {
    const existingStreak = await this.userStreaksRepository.findByUserId(userId)

    if (!existingStreak) {
      await this.userStreaksRepository.create({
        user: { connect: { id: userId } },
        currentStreak: 1,
        bestStreak: 1,
        lastWorkout: workoutDate,
      })
      return
    }

    const lastWorkoutDate = new Date(existingStreak.lastWorkout!)
    const diffInDays = Math.floor(
      (workoutDate.getTime() - lastWorkoutDate.getTime()) /
        (1000 * 60 * 60 * 24),
    )

    let currentStreak = existingStreak.currentStreak
    let bestStreak = existingStreak.bestStreak

    if (diffInDays === 0) {
      return
    } else if (diffInDays === 1) {
      currentStreak += 1
      if (currentStreak > bestStreak) bestStreak = currentStreak
    } else {
      currentStreak = 1
    }

    await this.userStreaksRepository.update(existingStreak.id, {
      currentStreak,
      bestStreak,
      lastWorkout: workoutDate,
    })
  }
}
