import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import { makeMeasuredSession } from '../tests/factories/make-measured-session'
import { CompareWorkoutsUseCase } from './compare-workouts.use-case'

describe('CompareWorkoutsUseCase duration volume', () => {
  let sessions: InMemoryWorkoutSessionsRepository
  let users: InMemoryUsersRepository
  let sut: CompareWorkoutsUseCase
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-17T12:00:00Z'))
    sessions = new InMemoryWorkoutSessionsRepository()
    users = new InMemoryUsersRepository()
    await makeUser(users, { id: 'user' })
    sut = new CompareWorkoutsUseCase(sessions, users)
  })
  afterEach(() => vi.useRealTimers())
  it.each([
    ['DURATION', 0],
    ['REPS', 3600],
    ['REPS', 0],
  ] as const)('should respect %s volume even for legacy stored values', async (measurement, expected) => {
    sessions.details.set(
      'current',
      makeMeasuredSession(
        'current',
        new Date(),
        measurement,
        expected === 0 && measurement === 'REPS' ? 0 : 3600
      )
    )
    sessions.details.set(
      'previous',
      makeMeasuredSession(
        'previous',
        new Date('2026-06-10T12:00:00Z'),
        measurement,
        expected === 0 && measurement === 'REPS' ? 0 : 3600
      )
    )
    const result = await sut.execute({ userId: 'user' })
    expect(result.currentPeriod.totalVolume).toBe(expected)
    expect(result.differences.volumeDiff).toBe(0)
  })
  it('should reject insufficient comparable history', async () => {
    await expect(sut.execute({ userId: 'user' })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
    sessions.details.set(
      'only',
      makeMeasuredSession('only', new Date(), 'REPS')
    )
    await expect(sut.execute({ userId: 'user' })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })
  it('should exclude another user and skipped sessions without logs from comparison', async () => {
    sessions.details.set(
      'current',
      makeMeasuredSession('current', new Date(), 'REPS')
    )
    sessions.details.set('other', {
      ...makeMeasuredSession('other', new Date('2026-05-17T12:00:00Z'), 'REPS'),
      userId: 'other',
    })
    sessions.details.set('skipped', {
      ...makeMeasuredSession(
        'skipped',
        new Date('2026-05-17T12:00:00Z'),
        'REPS'
      ),
      status: 'SKIPPED',
      exerciseSessions: [],
    })
    await expect(sut.execute({ userId: 'user' })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })

  it('should reject an unknown user', async () => {
    await expect(sut.execute({ userId: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })
  it('should compute growth from different executed performances', async () => {
    const current = makeMeasuredSession('current', new Date(), 'REPS', 8400)
    const exercise = current.exerciseSessions[0]
    const log = exercise?.logs[0]
    if (!log) {
      throw new Error('Missing fixture')
    }
    log.sets = 3
    log.reps = 40
    log.weight = 70
    sessions.details.set('current', current)
    sessions.details.set(
      'previous',
      makeMeasuredSession(
        'previous',
        new Date('2026-06-10T12:00:00Z'),
        'REPS',
        3600
      )
    )
    const result = await sut.execute({ userId: 'user' })
    expect(result.differences).toMatchObject({
      setsDiff: 1,
      repsDiff: 10,
      weightDiff: 10,
      volumeDiff: 4800,
    })
    expect(result.differences.percentageVolumeChange).toBeCloseTo(133.3333)
  })

  it('should compare local months across the year boundary', async () => {
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    sessions.details.set(
      'current',
      makeMeasuredSession('current', new Date(), 'REPS')
    )
    sessions.details.set(
      'previous',
      makeMeasuredSession('previous', new Date('2025-12-31T12:00:00Z'), 'REPS')
    )
    const result = await sut.execute({ userId: 'user', period: 'month' })
    expect(result.currentPeriod.start).toBe('2026-01-01T03:00:00.000Z')
    expect(result.previousPeriod.start).toBe('2025-12-01T03:00:00.000Z')
    expect(result.currentPeriod.totalWorkouts).toBe(1)
    expect(result.previousPeriod.totalWorkouts).toBe(1)
  })
  it('should compare ISO weeks across the year boundary', async () => {
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    sessions.details.set(
      'current',
      makeMeasuredSession('current', new Date('2025-12-31T12:00:00Z'), 'REPS')
    )
    sessions.details.set(
      'previous',
      makeMeasuredSession('previous', new Date('2025-12-28T12:00:00Z'), 'REPS')
    )
    const result = await sut.execute({ userId: 'user' })
    expect(result.currentPeriod.start).toBe('2025-12-29T03:00:00.000Z')
    expect(result.previousPeriod.start).toBe('2025-12-22T03:00:00.000Z')
  })
})
