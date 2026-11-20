import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryStreakUnitOfWork } from '../repositories/in-memory/in-memory-streak-unit-of-work'
import { InMemoryUserStreakLogsRepository } from '../repositories/in-memory/in-memory-user-streak-logs.repository'
import { InMemoryUserStreaksRepository } from '../repositories/in-memory/in-memory-user-streaks.repository'
import { GetUserStreakUseCase } from './get-user-streak.use-case'
import { UpdateUserStreakUseCase } from './update-user-streak.use-case'

let users: InMemoryUsersRepository
let streaks: InMemoryUserStreaksRepository
let logs: InMemoryUserStreakLogsRepository
let sut: UpdateUserStreakUseCase

describe('Update user streak', () => {
  it('should recover an original completion between newer credited days without regressing last workout', async () => {
    vi.setSystemTime(new Date('2026-06-12T12:00:00Z'))
    await sut.execute({
      userId: 'user',
      logDate: new Date('2026-06-10T12:00:00Z'),
    })
    await sut.execute({
      userId: 'user',
      logDate: new Date('2026-06-12T12:00:00Z'),
    })
    const streak = streaks.items[0]
    if (!streak) {
      throw new Error('Missing streak fixture')
    }
    await streaks.update(streak.id, { bestStreak: 7 })

    const request = {
      userId: 'user',
      logDate: new Date('2026-06-11T12:00:00Z'),
      recoverOriginalCompletion: true,
    }
    const expected = {
      currentStreak: 3,
      bestStreak: 7,
      lastWorkout: new Date('2026-06-12T03:00:00Z'),
    }
    expect(await sut.execute(request)).toEqual(expected)
    expect(await sut.execute(request)).toEqual(expected)
    expect(logs.items).toHaveLength(3)
    expect(streaks.items[0]).toMatchObject(expected)
  })

  it('should recover an older isolated completion without extending a newer streak', async () => {
    vi.setSystemTime(new Date('2026-06-12T12:00:00Z'))
    await sut.execute({
      userId: 'user',
      logDate: new Date('2026-06-12T12:00:00Z'),
    })
    expect(
      await sut.execute({
        userId: 'user',
        logDate: new Date('2026-06-08T12:00:00Z'),
        recoverOriginalCompletion: true,
      })
    ).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      lastWorkout: new Date('2026-06-12T03:00:00Z'),
    })
    expect(logs.items).toHaveLength(2)
  })

  beforeEach(async () => {
    users = new InMemoryUsersRepository()
    streaks = new InMemoryUserStreaksRepository()
    logs = new InMemoryUserStreakLogsRepository()
    await makeUser(users, { id: 'user' })
    sut = new UpdateUserStreakUseCase(
      new InMemoryStreakUnitOfWork({ streaks, logs, users })
    )
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())
  it('should reject a missing user without writing activity', async () => {
    await expect(
      sut.execute({ userId: 'missing', logDate: new Date() })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
    expect(logs.items).toHaveLength(0)
  })
  it('should start at one and normalize activity without mutating the input', async () => {
    const date = new Date('2026-06-11T02:00:00Z')
    const response = await sut.execute({ userId: 'user', logDate: date })
    expect(response).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      lastWorkout: new Date('2026-06-10T03:00:00Z'),
    })
    expect(date.toISOString()).toBe('2026-06-11T02:00:00.000Z')
    expect(logs.items).toHaveLength(1)
  })
  it('should start at one after a refresh created an empty streak', async () => {
    await streaks.create({ user: { connect: { id: 'user' } } })
    expect(
      await sut.execute({ userId: 'user', logDate: new Date() })
    ).toMatchObject({ currentStreak: 1, bestStreak: 1 })
  })
  it('should deduplicate different sessions on the same local day', async () => {
    await sut.execute({
      userId: 'user',
      logDate: new Date('2026-06-10T04:00:00Z'),
    })
    expect(
      await sut.execute({
        userId: 'user',
        logDate: new Date('2026-06-11T02:00:00Z'),
      })
    ).toMatchObject({ currentStreak: 1, bestStreak: 1 })
    expect(logs.items).toHaveLength(1)
  })
  it.each([
    ['America/Sao_Paulo', '2026-06-10T03:00:00Z', '2026-06-11T02:00:00Z', 4, 4],
    ['America/Sao_Paulo', '2026-06-10T03:00:00Z', '2026-06-11T03:00:00Z', 4, 5],
    ['America/Sao_Paulo', '2026-06-10T03:00:00Z', '2026-06-12T03:00:00Z', 0, 1],
    [
      'Pacific/Kiritimati',
      '2026-06-09T10:00:00Z',
      '2026-06-10T10:00:00Z',
      4,
      5,
    ],
    ['America/New_York', '2026-03-08T05:00:00Z', '2026-03-09T04:00:00Z', 4, 5],
    ['America/New_York', '2026-03-07T05:00:00Z', '2026-03-09T04:00:00Z', 0, 1],
    ['America/New_York', '2026-11-01T04:00:00Z', '2026-11-02T05:00:00Z', 4, 5],
    ['America/New_York', '2026-10-31T04:00:00Z', '2026-11-02T05:00:00Z', 0, 1],
  ])('should share the local break rule in %s from %s to %s', async (timezone, last, now, read, updated) => {
    await users.update('user', { timezone })
    await streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 4,
      bestStreak: 4,
      lastWorkout: new Date(last),
    })
    await logs.create({ userId: 'user', date: new Date(last) })
    vi.setSystemTime(new Date(now))
    expect(
      await new GetUserStreakUseCase(streaks, users).execute('user')
    ).toMatchObject({ currentStreak: read })
    expect(
      await sut.execute({ userId: 'user', logDate: new Date(now) })
    ).toMatchObject({
      currentStreak: updated,
      bestStreak: Math.max(4, updated),
    })
  })
  it('should create one streak and one activity day for concurrent completions', async () => {
    const date = new Date('2026-06-10T12:00:00Z')
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        sut.execute({ userId: 'user', logDate: date })
      )
    )
    expect(
      results.every(
        (result) => result.currentStreak === 1 && result.bestStreak === 1
      )
    ).toBe(true)
    expect(logs.items).toHaveLength(1)
    expect(streaks.items).toHaveLength(1)
  })
  it('should increment only once when concurrent completions extend a streak', async () => {
    await sut.execute({
      userId: 'user',
      logDate: new Date('2026-06-10T12:00:00Z'),
    })
    await Promise.all(
      Array.from({ length: 12 }, () =>
        sut.execute({
          userId: 'user',
          logDate: new Date('2026-06-11T12:00:00Z'),
        })
      )
    )
    expect(streaks.items[0]).toMatchObject({ currentStreak: 2, bestStreak: 2 })
    expect(logs.items).toHaveLength(2)
  })
  it.each([
    'create',
    'update',
  ] as const)('should roll back activity after a streak %s failure and allow retry', async (method) => {
    if (method === 'update') {
      await sut.execute({
        userId: 'user',
        logDate: new Date('2026-06-10T12:00:00Z'),
      })
    }
    const before = structuredClone({ streaks: streaks.items, logs: logs.items })
    vi.spyOn(streaks, method).mockRejectedValueOnce(
      new Error('Persistence failed.')
    )
    const request = {
      userId: 'user',
      logDate: new Date('2026-06-11T12:00:00Z'),
    }
    await expect(sut.execute(request)).rejects.toThrow('Persistence failed.')
    expect({ streaks: streaks.items, logs: logs.items }).toEqual(before)
    expect(await sut.execute(request)).toMatchObject({
      currentStreak: method === 'update' ? 2 : 1,
    })
    expect(logs.items).toHaveLength(method === 'update' ? 2 : 1)
  })
  it('should leave streaks untouched after an activity insert failure', async () => {
    vi.spyOn(logs, 'create').mockRejectedValueOnce(
      new Error('Persistence failed.')
    )
    const request = { userId: 'user', logDate: new Date() }
    await expect(sut.execute(request)).rejects.toThrow('Persistence failed.')
    expect(streaks.items).toHaveLength(0)
    expect(logs.items).toHaveLength(0)
    expect(await sut.execute(request)).toMatchObject({ currentStreak: 1 })
  })
})
