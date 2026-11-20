import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { AnotherExerciseTimerRunningError } from '../errors/another-exercise-timer-running.error'
import { ExerciseTimerAlreadyRunningError } from '../errors/exercise-timer-already-running.error'
import { InMemoryExerciseSessionsRepository } from '../repositories/in-memory/in-memory-exercise-sessions.repository'
import { InMemoryExerciseTimerUnitOfWork } from '../repositories/in-memory/in-memory-exercise-timer-unit-of-work'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import {
  makeTimerExerciseSession,
  makeTimerWorkoutSession,
} from '../tests/factories/make-timer-session'
import { StartExerciseTimerUseCase } from './start-exercise-timer.use-case'

let exercises: InMemoryExerciseSessionsRepository
let workouts: InMemoryWorkoutSessionsRepository
let sut: StartExerciseTimerUseCase
const request = { userId: 'user', exerciseSessionId: 'exercise-session' }
describe('StartExerciseTimerUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:10Z'))
    exercises = new InMemoryExerciseSessionsRepository()
    workouts = new InMemoryWorkoutSessionsRepository()
    workouts.items.push(makeTimerWorkoutSession())
    exercises.items.push(makeTimerExerciseSession())
    const unitOfWork = new InMemoryExerciseTimerUnitOfWork({
      exerciseSessions: exercises,
      workoutSessions: workouts,
    })
    sut = new StartExerciseTimerUseCase(unitOfWork)
  })
  afterEach(() => vi.useRealTimers())
  it.each([
    'PENDING',
    'COMPLETED',
    'INCOMPLETE',
    'SKIPPED',
  ] as const)('should reject %s sessions', async (status) => {
    workouts.items = [makeTimerWorkoutSession({ status })]
    await expect(sut.execute(request)).rejects.toBeInstanceOf(NotAllowedError)
    expect(exercises.writes).toBe(0)
  })
  it('should reject ended sessions', async () => {
    workouts.items = [makeTimerWorkoutSession({ endedAt: new Date() })]
    await expect(sut.execute(request)).rejects.toBeInstanceOf(NotAllowedError)
  })
  it('should reject completed exercises', async () => {
    exercises.items = [makeTimerExerciseSession({ completed: true })]
    await expect(sut.execute(request)).rejects.toBeInstanceOf(NotAllowedError)
  })
  it('should hide sessions owned by another user', async () => {
    await expect(sut.execute({ ...request, userId: 'other' })).rejects.toEqual(
      new ResourceNotFoundError('Exercise session not found.')
    )
  })
  it('should reject missing exercises and sessions', async () => {
    await expect(
      sut.execute({ ...request, exerciseSessionId: 'missing' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
    workouts.items = []
    await expect(sut.execute(request)).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })

  it('should start and clear previous measurement on restart', async () => {
    exercises.items = [
      makeTimerExerciseSession({
        startedAt: new Date(0),
        endedAt: new Date(1000),
        duration: 1,
      }),
    ]
    const { exerciseSession } = await sut.execute(request)
    expect(exerciseSession).toMatchObject({
      startedAt: new Date(),
      endedAt: null,
      duration: null,
    })
  })
  it('should reject an already running timer', async () => {
    await sut.execute(request)
    await expect(sut.execute(request)).rejects.toBeInstanceOf(
      ExerciseTimerAlreadyRunningError
    )
  })
  it('should allow only one concurrent start across exercises', async () => {
    exercises.items.push(
      makeTimerExerciseSession({ id: 'second', exerciseId: 'second-exercise' })
    )
    const results = await Promise.allSettled([
      sut.execute(request),
      sut.execute({ ...request, exerciseSessionId: 'second' }),
    ])
    expect(
      results.filter((result) => result.status === 'fulfilled')
    ).toHaveLength(1)
    expect(results[1]).toMatchObject({
      status: 'rejected',
      reason: new AnotherExerciseTimerRunningError(),
    })
    expect(exercises.writes).toBe(1)
  })
  it('should allow only one concurrent start of the same exercise', async () => {
    const results = await Promise.allSettled([
      sut.execute(request),
      sut.execute(request),
    ])
    expect(
      results.filter((result) => result.status === 'fulfilled')
    ).toHaveLength(1)
    expect(exercises.writes).toBe(1)
  })
  it('rejects an expired daily session without modifying execution', async () => {
    const parent = workouts.items[0]
    if (!parent) {
      throw new Error('Missing fixture')
    }
    workouts.dailyIdentities.push({
      userId: parent.userId,
      sessionId: parent.id,
      businessDate: '2000-01-01',
      timezone: 'America/Sao_Paulo',
    })
    await expect(sut.execute(request)).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(exercises.writes).toBe(0)
  })
})
