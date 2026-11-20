import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import { makeTimerWorkoutSession } from '../tests/factories/make-timer-session'
import { GetWeeklyWorkoutCalendarUseCase } from './get-weekly-workout-calendar.use-case'

describe('GetWeeklyWorkoutCalendarUseCase', () => {
  let sessions: InMemoryWorkoutSessionsRepository
  let users: InMemoryUsersRepository
  let sut: GetWeeklyWorkoutCalendarUseCase
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T01:00:00Z'))
    sessions = new InMemoryWorkoutSessionsRepository()
    users = new InMemoryUsersRepository()
    await makeUser(users, { id: 'user', timezone: 'America/Sao_Paulo' })
    sut = new GetWeeklyWorkoutCalendarUseCase(sessions, users)
  })
  afterEach(() => vi.useRealTimers())
  it('should reject unknown users', async () => {
    await expect(sut.execute('missing')).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })
  it('should default to the local calendar across the year boundary', async () => {
    const result = await sut.execute('user')
    const days = result.week
    expect(days).toHaveLength(7)
    expect(days[0]?.date).toBe('2025-12-29')
    expect(days.at(-1)?.date).toBe('2026-01-04')
    expect(days.every((day) => !day.completed)).toBe(true)
  })
  it('should group activity by local day and exclude another user', async () => {
    sessions.items.push(
      makeTimerWorkoutSession({
        id: 'done',
        date: new Date('2026-01-01T01:00:00Z'),
        status: 'COMPLETED',
      }),
      makeTimerWorkoutSession({
        id: 'foreign',
        userId: 'other',
        date: new Date('2025-12-30T12:00:00Z'),
        status: 'COMPLETED',
      }),
      makeTimerWorkoutSession({
        id: 'pending',
        date: new Date('2025-12-31T12:00:00Z'),
        status: 'PENDING',
      })
    )
    const result = await sut.execute('user')
    const days = result.week
    expect(days.find((day) => day.date === '2025-12-31')?.completed).toBe(true)
    expect(days.find((day) => day.date === '2025-12-30')?.completed).toBe(false)
  })
  it.each([
    'PENDING',
    'IN_PROGRESS',
    'INCOMPLETE',
    'SKIPPED',
  ] as const)('should not count %s as a completed day', async (status) => {
    sessions.items.push(makeTimerWorkoutSession({ date: new Date(), status }))
    const result = await sut.execute('user')
    expect(result.week.every((day) => !day.completed)).toBe(true)
  })
  it('should start an ISO week on Monday when today is Sunday', async () => {
    vi.setSystemTime(new Date('2026-01-04T12:00:00Z'))
    const result = await sut.execute('user')
    expect(result.week[0]?.date).toBe('2025-12-29')
    expect(result.week.at(-1)?.date).toBe('2026-01-04')
  })
})
