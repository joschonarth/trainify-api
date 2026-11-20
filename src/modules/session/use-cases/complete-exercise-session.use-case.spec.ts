import { beforeEach, describe, expect, it } from 'vitest'
import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryExerciseSessionsRepository } from '../repositories/in-memory/in-memory-exercise-sessions.repository'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import { makeLoggedExerciseSession } from '../tests/factories/make-logged-exercise-session'
import { makeTimerWorkoutSession } from '../tests/factories/make-timer-session'
import { CompleteExerciseSessionUseCase } from './complete-exercise-session.use-case'

describe('CompleteExerciseSessionUseCase', () => {
  let exercises: InMemoryExerciseSessionsRepository
  let workouts: InMemoryWorkoutSessionsRepository
  let sut: CompleteExerciseSessionUseCase
  const request = { userId: 'user', exerciseSessionId: 'exercise-session' }
  beforeEach(() => {
    exercises = new InMemoryExerciseSessionsRepository()
    workouts = new InMemoryWorkoutSessionsRepository()
    const exercise = makeLoggedExerciseSession()
    exercises.items.push(exercise)
    exercises.details.set(exercise.id, exercise)
    workouts.items.push(makeTimerWorkoutSession())
    sut = new CompleteExerciseSessionUseCase(exercises, workouts)
  })
  it('should hide missing exercises and foreign or missing parent sessions', async () => {
    await expect(
      sut.execute({ ...request, exerciseSessionId: 'missing' })
    ).rejects.toEqual(new ResourceNotFoundError('Exercise session not found.'))
    await expect(sut.execute({ ...request, userId: 'other' })).rejects.toEqual(
      new ResourceNotFoundError('Exercise session not found.')
    )
    workouts.items = []
    await expect(sut.execute(request)).rejects.toEqual(
      new ResourceNotFoundError('Exercise session not found.')
    )
    expect(exercises.writes).toBe(0)
  })

  it('should complete an exercise with an existing log without creating another log', async () => {
    const result = await sut.execute(request)
    expect(result.exerciseSession.completed).toBe(true)
    expect(exercises.details.get('exercise-session')?.logs).toHaveLength(1)
  })
  it('should reject an exercise without execution logs', async () => {
    exercises.details.set(
      'exercise-session',
      makeLoggedExerciseSession({ logs: [] })
    )
    await expect(sut.execute(request)).rejects.toBeInstanceOf(NotAllowedError)
    expect(exercises.writes).toBe(0)
  })
  it.each([
    'PENDING',
    'COMPLETED',
    'INCOMPLETE',
    'SKIPPED',
  ] as const)('should reject completion in a %s session', async (status) => {
    workouts.items = [makeTimerWorkoutSession({ status })]
    await expect(sut.execute(request)).rejects.toBeInstanceOf(NotAllowedError)
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
