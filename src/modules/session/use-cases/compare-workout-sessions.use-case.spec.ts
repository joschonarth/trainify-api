import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import { makeMeasuredSession } from '../tests/factories/make-measured-session'
import { CompareWorkoutSessionsUseCase } from './compare-workout-sessions.use-case'

describe('CompareWorkoutSessionsUseCase duration volume', () => {
  let sessions: InMemoryWorkoutSessionsRepository
  let users: InMemoryUsersRepository
  let sut: CompareWorkoutSessionsUseCase
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-17T12:00:00Z'))
    sessions = new InMemoryWorkoutSessionsRepository()
    users = new InMemoryUsersRepository()
    await makeUser(users, { id: 'user' })
    sut = new CompareWorkoutSessionsUseCase(sessions)
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
    const result = await sut.execute({ userId: 'user', workoutId: 'workout' })
    expect(result.lastSession.totalVolume).toBe(expected)
    expect(result.previousSession.totalVolume).toBe(expected)
    expect(result.differenceInVolume).toBe(0)
  })
})
