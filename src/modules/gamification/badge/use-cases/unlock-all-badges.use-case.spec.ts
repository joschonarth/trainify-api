import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUserStreaksRepository } from '@/modules/gamification/streak/repositories/in-memory/in-memory-user-streaks.repository'
import { InMemoryExerciseSessionsRepository } from '@/modules/session/repositories/in-memory/in-memory-exercise-sessions.repository'
import { InMemoryWorkoutSessionsRepository } from '@/modules/session/repositories/in-memory/in-memory-workout-sessions.repository'
import {
  makeTimerExerciseSession,
  makeTimerWorkoutSession,
} from '@/modules/session/tests/factories/make-timer-session'
import { InMemoryBadgesRepository } from '../repositories/in-memory/in-memory-badges.repository'
import { makeBadge } from '../tests/factories/make-badge'
import { UnlockAllBadgesUseCase } from './unlock-all-badges.use-case'
import { UnlockExerciseBadgesUseCase } from './unlock-exercise-badges.use-case'
import { UnlockStreakBadgesUseCase } from './unlock-streak-badges.use-case'
import { UnlockWorkoutBadgesUseCase } from './unlock-workout-badges.use-case'

let badges: InMemoryBadgesRepository
let sut: UnlockAllBadgesUseCase

describe('Unlock all badges', () => {
  beforeEach(async () => {
    badges = new InMemoryBadgesRepository()
    const workouts = new InMemoryWorkoutSessionsRepository()
    const exercises = new InMemoryExerciseSessionsRepository(workouts)
    const streaks = new InMemoryUserStreaksRepository()
    workouts.items.push(makeTimerWorkoutSession({ status: 'COMPLETED' }))
    exercises.items.push(makeTimerExerciseSession({ completed: true }))
    await streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 1,
      bestStreak: 1,
    })
    for (const type of ['WORKOUT', 'EXERCISE', 'STREAK'] as const) {
      badges.items.push(makeBadge({ type }))
    }
    const unlockWorkout = new UnlockWorkoutBadgesUseCase(badges, workouts)
    const unlockExercise = new UnlockExerciseBadgesUseCase(badges, exercises)
    const unlockStreak = new UnlockStreakBadgesUseCase(badges, streaks)
    sut = new UnlockAllBadgesUseCase(
      unlockWorkout,
      unlockExercise,
      unlockStreak
    )
  })
  it('should report each newly awarded badge once across concurrent calls and retries', async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () => sut.execute({ userId: 'user' }))
    )
    expect(results.flatMap((result) => result.badges)).toEqual(badges.items)
    expect(badges.userBadges).toHaveLength(3)
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
  })
  it('should recover remaining badges after a partial failure without reporting old awards', async () => {
    const persist = badges.unlockForUser.bind(badges)
    vi.spyOn(badges, 'unlockForUser')
      .mockImplementationOnce(persist)
      .mockRejectedValueOnce(new Error('Persistence failed.'))
    await expect(sut.execute({ userId: 'user' })).rejects.toThrow(
      'Persistence failed.'
    )
    expect(badges.userBadges).toHaveLength(1)
    expect(await sut.execute({ userId: 'user' })).toEqual({
      badges: badges.items.slice(1),
    })
    expect(badges.userBadges).toHaveLength(3)
  })
})
