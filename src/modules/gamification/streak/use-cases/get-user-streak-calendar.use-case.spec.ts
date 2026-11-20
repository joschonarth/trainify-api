import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryUserStreakLogsRepository } from '../repositories/in-memory/in-memory-user-streak-logs.repository'
import { GetUserStreakCalendarUseCase } from './get-user-streak-calendar.use-case'

let users: InMemoryUsersRepository
let logs: InMemoryUserStreakLogsRepository
let sut: GetUserStreakCalendarUseCase

describe('Get user streak calendar', () => {
  beforeEach(async () => {
    users = new InMemoryUsersRepository()
    logs = new InMemoryUserStreakLogsRepository()
    await makeUser(users, { id: 'user', timezone: 'America/Sao_Paulo' })
    sut = new GetUserStreakCalendarUseCase(logs, users)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-01-01T02:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('should use the local month and year when both are omitted', async () => {
    const { days } = await sut.execute({ userId: 'user' })
    expect(days).toHaveLength(31)
    expect(days[0]).toEqual({ date: '2026-12-01', completed: false })
    expect(days.at(-1)).toEqual({ date: '2026-12-31', completed: false })
  })

  it('should default only the omitted year or month using the user timezone', async () => {
    const month = await sut.execute({ userId: 'user', month: 2 })
    expect(month.days).toHaveLength(28)
    expect(month.days[0]?.date).toBe('2026-02-01')
    const year = await sut.execute({ userId: 'user', year: 2024 })
    expect(year.days[0]?.date).toBe('2024-12-01')
  })

  it('should include leap day in an explicitly requested February', async () => {
    await logs.create({
      userId: 'user',
      date: new Date('2024-03-01T02:59:59Z'),
    })
    const { days } = await sut.execute({ userId: 'user', year: 2024, month: 2 })
    expect(days).toHaveLength(29)
    expect(days.at(-1)).toEqual({ date: '2024-02-29', completed: true })
  })

  it('should honor inclusive local month bounds and isolate another user activity', async () => {
    for (const date of [
      '2026-06-01T02:59:59.999Z',
      '2026-06-01T03:00:00Z',
      '2026-07-01T02:59:59.999Z',
      '2026-07-01T03:00:00Z',
    ]) {
      await logs.create({ userId: 'user', date: new Date(date) })
    }
    await logs.create({
      userId: 'other',
      date: new Date('2026-06-15T12:00:00Z'),
    })
    const { days } = await sut.execute({ userId: 'user', year: 2026, month: 6 })
    expect(days).toHaveLength(30)
    expect(days.filter((day) => day.completed)).toEqual([
      { date: '2026-06-01', completed: true },
      { date: '2026-06-30', completed: true },
    ])
  })

  it('should represent multiple logs in the same local day as one completed day without writing', async () => {
    await logs.create({
      userId: 'user',
      date: new Date('2026-06-10T03:00:00Z'),
    })
    await logs.create({
      userId: 'user',
      date: new Date('2026-06-11T02:59:59Z'),
    })
    const before = structuredClone(logs.items)
    const { days } = await sut.execute({ userId: 'user', year: 2026, month: 6 })
    expect(days.filter((day) => day.completed)).toEqual([
      { date: '2026-06-10', completed: true },
    ])
    expect(logs.items).toEqual(before)
  })

  it.each([
    [
      3,
      '2026-03-08T06:59:00Z',
      '2026-03-08T07:01:00Z',
      '2026-03-09T03:59:59Z',
      '2026-03-09T04:00:00Z',
      '2026-03-08',
      '2026-03-09',
    ],
    [
      11,
      '2026-11-01T05:30:00Z',
      '2026-11-01T06:30:00Z',
      '2026-11-02T04:59:59Z',
      '2026-11-02T05:00:00Z',
      '2026-11-01',
      '2026-11-02',
    ],
  ])('should map activity to calendar days across DST in month %s', async (month, before, after, finalInstant, nextDay, firstDate, secondDate) => {
    await users.update('user', { timezone: 'America/New_York' })
    for (const date of [before, after, finalInstant, nextDay]) {
      await logs.create({ userId: 'user', date: new Date(date) })
    }
    const { days } = await sut.execute({ userId: 'user', year: 2026, month })
    expect(days.filter((day) => day.completed)).toEqual([
      { date: firstDate, completed: true },
      { date: secondDate, completed: true },
    ])
  })

  it('should default to the new local year in a timezone ahead of UTC', async () => {
    await users.update('user', { timezone: 'Pacific/Kiritimati' })
    vi.setSystemTime(new Date('2026-12-31T10:00:00Z'))
    expect((await sut.execute({ userId: 'user' })).days[0]?.date).toBe(
      '2027-01-01'
    )
  })

  it('should reject a missing user without creating activity', async () => {
    await expect(sut.execute({ userId: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
    expect(logs.items).toHaveLength(0)
  })
})
