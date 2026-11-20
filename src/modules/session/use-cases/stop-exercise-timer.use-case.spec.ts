import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { ExerciseTimerNotStartedError } from '../errors/exercise-timer-not-started.error'
import { InMemoryExerciseSessionsRepository } from '../repositories/in-memory/in-memory-exercise-sessions.repository'
import { InMemoryExerciseTimerUnitOfWork } from '../repositories/in-memory/in-memory-exercise-timer-unit-of-work'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import {
  makeTimerExerciseSession,
  makeTimerWorkoutSession,
} from '../tests/factories/make-timer-session'
import { StartExerciseTimerUseCase } from './start-exercise-timer.use-case'
import { StopExerciseTimerUseCase } from './stop-exercise-timer.use-case'

let exercises: InMemoryExerciseSessionsRepository
let workouts: InMemoryWorkoutSessionsRepository
let sut: StopExerciseTimerUseCase
const request = { userId: 'user', exerciseSessionId: 'exercise-session' }
describe('StopExerciseTimerUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:10Z'))
    exercises = new InMemoryExerciseSessionsRepository()
    workouts = new InMemoryWorkoutSessionsRepository()
    workouts.items.push(makeTimerWorkoutSession())
    exercises.items.push(
      makeTimerExerciseSession({ startedAt: new Date('2026-01-01T12:00:00Z') })
    )
    const unitOfWork = new InMemoryExerciseTimerUnitOfWork({
      exerciseSessions: exercises,
      workoutSessions: workouts,
    })
    sut = new StopExerciseTimerUseCase(unitOfWork)
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

  it('should stop with elapsed whole seconds', async () => {
    const result = await sut.execute(request)
    expect(result.elapsed).toBe(10)
    expect(result.exerciseSession.endedAt).toEqual(new Date())
    expect(result.exerciseSession.duration).toBe(10)
  })
  it('should preserve the original measurement without writing on repeated stop', async () => {
    const first = await sut.execute(request)
    vi.advanceTimersByTime(5000)
    const second = await sut.execute(request)
    expect(second.elapsed).toBe(10)
    expect(second.exerciseSession.endedAt).toEqual(
      first.exerciseSession.endedAt
    )
    expect(exercises.writes).toBe(1)
  })
  it('should serialize concurrent stops without changing the measurement', async () => {
    const results = await Promise.all([
      sut.execute(request),
      sut.execute(request),
    ])
    expect(results.map((result) => result.elapsed)).toEqual([10, 10])
    expect(exercises.writes).toBe(1)
  })
  it('should measure a fresh interval after restart', async () => {
    await sut.execute(request)
    vi.advanceTimersByTime(5000)
    const unitOfWork = new InMemoryExerciseTimerUnitOfWork({
      exerciseSessions: exercises,
      workoutSessions: workouts,
    })
    const start = new StartExerciseTimerUseCase(unitOfWork)
    const restarted = await start.execute(request)
    expect(restarted.exerciseSession.duration).toBeNull()
    expect(restarted.exerciseSession.endedAt).toBeNull()
    vi.advanceTimersByTime(3000)
    const result = await sut.execute(request)
    expect(result.elapsed).toBe(3)
  })
  it('should preserve legacy timestamps when a stopped timer has no duration', async () => {
    exercises.items = [
      makeTimerExerciseSession({
        startedAt: new Date('2026-01-01T12:00:00Z'),
        endedAt: new Date('2026-01-01T12:00:05Z'),
      }),
    ]
    const result = await sut.execute(request)
    expect(result.elapsed).toBe(5)
    expect(result.exerciseSession.duration).toBeNull()
    expect(exercises.writes).toBe(0)
  })
  it('should reject stop without start', async () => {
    exercises.items = [makeTimerExerciseSession()]
    await expect(sut.execute(request)).rejects.toBeInstanceOf(
      ExerciseTimerNotStartedError
    )
    expect(exercises.writes).toBe(0)
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
