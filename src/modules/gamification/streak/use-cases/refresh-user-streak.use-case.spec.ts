import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryStreakUnitOfWork } from '../repositories/in-memory/in-memory-streak-unit-of-work'
import { InMemoryUserStreakLogsRepository } from '../repositories/in-memory/in-memory-user-streak-logs.repository'
import { InMemoryUserStreaksRepository } from '../repositories/in-memory/in-memory-user-streaks.repository'
import { RefreshUserStreakUseCase } from './refresh-user-streak.use-case'
import { UpdateUserStreakUseCase } from './update-user-streak.use-case'

let users: InMemoryUsersRepository
let streaks: InMemoryUserStreaksRepository
let logs: InMemoryUserStreakLogsRepository
let sut: RefreshUserStreakUseCase

describe('Refresh user streak', () => {
  it('should clear stale current metadata without activity while preserving the historical best', async () => {
    await streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 4,
      bestStreak: 7,
      lastWorkout: new Date('2026-03-09T04:00:00Z'),
    })
    expect(await sut.execute({ userId: 'user' })).toEqual({
      currentStreak: 0,
      bestStreak: 7,
      lastWorkout: null,
    })
    expect(logs.items).toHaveLength(0)
  })

  it('should allow retry after a refresh persistence failure without altering activity', async () => {
    await logs.create({
      userId: 'user',
      date: new Date('2026-03-09T04:00:00Z'),
    })
    await streaks.create({ user: { connect: { id: 'user' } }, bestStreak: 7 })
    const before = structuredClone({ logs: logs.items, streaks: streaks.items })
    vi.spyOn(streaks, 'update').mockRejectedValueOnce(
      new Error('Persistence failed.')
    )
    await expect(sut.execute({ userId: 'user' })).rejects.toThrow(
      'Persistence failed.'
    )
    expect({ logs: logs.items, streaks: streaks.items }).toEqual(before)
    expect(await sut.execute({ userId: 'user' })).toEqual({
      currentStreak: 1,
      bestStreak: 7,
      lastWorkout: new Date('2026-03-09T04:00:00Z'),
    })
    expect(logs.items).toEqual(before.logs)
  })

  beforeEach(async () => {
    users = new InMemoryUsersRepository()
    streaks = new InMemoryUserStreaksRepository()
    logs = new InMemoryUserStreakLogsRepository()
    await makeUser(users, { id: 'user', timezone: 'America/New_York' })
    sut = new RefreshUserStreakUseCase(
      new InMemoryStreakUnitOfWork({ streaks, logs, users })
    )
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-10T04:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())
  it('should reject a missing user', async () => {
    await expect(sut.execute({ userId: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
    expect(streaks.items).toHaveLength(0)
  })
  it('should refresh repeatedly without creating activity', async () => {
    for (let i = 0; i < 2; i++) {
      expect(await sut.execute({ userId: 'user' })).toEqual({
        currentStreak: 0,
        bestStreak: 0,
        lastWorkout: null,
      })
    }
    expect(logs.items).toHaveLength(0)
    expect(streaks.items).toHaveLength(1)
  })
  it('should rebuild from unique local activity days across DST and preserve the best streak', async () => {
    await streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 0,
      bestStreak: 8,
    })
    for (const date of [
      '2026-03-09T05:00:00Z',
      '2026-03-07T06:00:00Z',
      '2026-03-08T06:00:00Z',
      '2026-03-09T20:00:00Z',
    ]) {
      await logs.create({ userId: 'user', date: new Date(date) })
    }
    await logs.create({
      userId: 'other',
      date: new Date('2026-03-10T04:00:00Z'),
    })
    const before = structuredClone(logs.items)
    const response = {
      currentStreak: 3,
      bestStreak: 8,
      lastWorkout: new Date('2026-03-09T04:00:00Z'),
    }
    expect(await sut.execute({ userId: 'user' })).toEqual(response)
    expect(await sut.execute({ userId: 'user' })).toEqual(response)
    expect(streaks.items[0]).toMatchObject(response)
    expect(logs.items).toEqual(before)
  })
  it('should recover the best streak and reset a broken current streak from existing logs', async () => {
    for (const date of [
      '2026-03-05T05:00:00Z',
      '2026-03-06T05:00:00Z',
      '2026-03-08T05:00:00Z',
    ]) {
      await logs.create({ userId: 'user', date: new Date(date) })
    }
    expect(await sut.execute({ userId: 'user' })).toEqual({
      currentStreak: 0,
      bestStreak: 2,
      lastWorkout: new Date('2026-03-08T05:00:00Z'),
    })
    expect(logs.items).toHaveLength(3)
  })
  it('should serialize refresh with activity and preserve the credited day', async () => {
    const unitOfWork = new InMemoryStreakUnitOfWork({ users, streaks, logs })
    sut = new RefreshUserStreakUseCase(unitOfWork)
    const update = new UpdateUserStreakUseCase(unitOfWork)
    await Promise.all([
      sut.execute({ userId: 'user' }),
      update.execute({ userId: 'user', logDate: new Date() }),
      sut.execute({ userId: 'user' }),
      update.execute({ userId: 'user', logDate: new Date() }),
    ])
    expect(streaks.items).toHaveLength(1)
    expect(streaks.items[0]).toMatchObject({ currentStreak: 1, bestStreak: 1 })
    expect(logs.items).toHaveLength(1)
  })
  it('should create only one streak for concurrent refresh requests without creating activity', async () => {
    await Promise.all(
      Array.from({ length: 12 }, () => sut.execute({ userId: 'user' }))
    )
    expect(streaks.items).toHaveLength(1)
    expect(logs.items).toHaveLength(0)
  })
})
