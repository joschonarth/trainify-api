import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryUserStreakLogsRepository } from '../repositories/in-memory/in-memory-user-streak-logs.repository'
import { InMemoryUserStreaksRepository } from '../repositories/in-memory/in-memory-user-streaks.repository'
import { GetUserStreakUseCase } from './get-user-streak.use-case'

let users: InMemoryUsersRepository
let streaks: InMemoryUserStreaksRepository
let logs: InMemoryUserStreakLogsRepository
let sut: GetUserStreakUseCase

describe('Get user streak', () => {
  beforeEach(async () => {
    users = new InMemoryUsersRepository()
    streaks = new InMemoryUserStreaksRepository()
    logs = new InMemoryUserStreakLogsRepository()
    await makeUser(users, { id: 'user' })
    sut = new GetUserStreakUseCase(streaks, users)
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())
  it('should return zero without creating a streak', async () => {
    expect(await sut.execute('user')).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      lastWorkout: null,
    })
    expect(streaks.items).toHaveLength(0)
  })
  it('should reject a missing user', async () => {
    await expect(sut.execute('missing')).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })
  it.each([
    ['America/Sao_Paulo', '2026-06-10T03:00:00Z', '2026-06-11T02:59:00Z', 4],
    ['America/Sao_Paulo', '2026-06-10T03:00:00Z', '2026-06-12T02:59:00Z', 4],
    ['America/Sao_Paulo', '2026-06-10T03:00:00Z', '2026-06-12T03:00:00Z', 0],
    ['Pacific/Kiritimati', '2026-06-09T10:00:00Z', '2026-06-10T10:00:00Z', 4],
    ['America/New_York', '2026-03-08T05:00:00Z', '2026-03-09T04:00:00Z', 4],
    ['America/New_York', '2026-03-07T05:00:00Z', '2026-03-09T04:00:00Z', 0],
    ['America/New_York', '2026-11-01T04:00:00Z', '2026-11-02T05:00:00Z', 4],
    ['America/New_York', '2026-10-31T04:00:00Z', '2026-11-02T05:00:00Z', 0],
  ])('should calculate local days in %s from %s to %s', async (timezone, last, now, expected) => {
    await users.update('user', { timezone })
    const date = new Date(last)
    await streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 4,
      bestStreak: 7,
      lastWorkout: date,
    })
    const before = structuredClone(streaks.items)
    vi.setSystemTime(new Date(now))
    expect(await sut.execute('user')).toEqual({
      currentStreak: expected,
      bestStreak: 7,
      lastWorkout: date,
    })
    expect(streaks.items).toEqual(before)
    expect(date.toISOString()).toBe(new Date(last).toISOString())
    expect(logs.items).toHaveLength(0)
  })
  it('should return zero when no last workout exists', async () => {
    await streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 3,
      bestStreak: 7,
    })
    expect(await sut.execute('user')).toEqual({
      currentStreak: 0,
      bestStreak: 7,
      lastWorkout: null,
    })
  })
})
