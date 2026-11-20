import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import { makeMeasuredSession } from '../tests/factories/make-measured-session'
import { CompareWeeklyWorkoutsUseCase } from './compare-weekly-workouts.use-case'

describe('CompareWeeklyWorkoutsUseCase duration volume', () => {
  let sessions: InMemoryWorkoutSessionsRepository
  let users: InMemoryUsersRepository
  let sut: CompareWeeklyWorkoutsUseCase
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-17T12:00:00Z'))
    sessions = new InMemoryWorkoutSessionsRepository()
    users = new InMemoryUsersRepository()
    await makeUser(users, { id: 'user' })
    sut = new CompareWeeklyWorkoutsUseCase(sessions, users)
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
    expect(result.currentWeek.totalVolume).toBe(expected)
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
})
