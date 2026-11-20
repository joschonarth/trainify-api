import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InMemoryExerciseSessionsRepository } from '../repositories/in-memory/in-memory-exercise-sessions.repository'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import { makeLoggedExerciseSession } from '../tests/factories/make-logged-exercise-session'
import { makeTimerWorkoutSession } from '../tests/factories/make-timer-session'
import { GetExerciseSessionDetailsUseCase } from './get-exercise-session-details.use-case'

describe('GetExerciseSessionDetailsUseCase', () => {
  let exercises: InMemoryExerciseSessionsRepository
  let workouts: InMemoryWorkoutSessionsRepository
  let sut: GetExerciseSessionDetailsUseCase
  const request = { userId: 'user', exerciseSessionId: 'exercise-session' }
  beforeEach(() => {
    exercises = new InMemoryExerciseSessionsRepository()
    workouts = new InMemoryWorkoutSessionsRepository()
    const exercise = makeLoggedExerciseSession()
    exercises.items.push(exercise)
    exercises.details.set(exercise.id, exercise)
    workouts.items.push(makeTimerWorkoutSession())
    sut = new GetExerciseSessionDetailsUseCase(exercises, workouts)
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

  it('should return planned and latest logged performance without writing', async () => {
    const result = await sut.execute(request)
    expect(result.session).toMatchObject({
      plannedReps: 10,
      loggedReps: 12,
      loggedSets: 2,
      loggedWeight: 20,
      description: 'Notes',
      repsComparison: { plannedReps: 10, loggedReps: 12, metPlan: true },
    })
    expect(exercises.writes).toBe(0)
  })
  it('should return null execution and comparison fields without logs', async () => {
    exercises.details.set(
      'exercise-session',
      makeLoggedExerciseSession({ logs: [] })
    )
    const result = await sut.execute(request)
    expect(result.session).toMatchObject({
      loggedReps: null,
      loggedSets: null,
      loggedWeight: null,
      description: null,
      repsComparison: null,
    })
  })
  it('should derive skipped state from ended parent sessions', async () => {
    workouts.items = [makeTimerWorkoutSession({ endedAt: new Date() })]
    expect((await sut.execute(request)).session.state).toBe('SKIPPED')
  })
  it('should keep completed state for completed exercises and unknown target comparison', async () => {
    const exercise = makeLoggedExerciseSession({
      completed: true,
      plannedReps: null,
    })
    exercises.items = [exercise]
    exercises.details.set(exercise.id, exercise)
    const result = await sut.execute(request)
    expect(result.session.state).toBe('COMPLETED')
    expect(result.session.repsComparison?.metPlan).toBeNull()
  })
  it('should report when logged performance is below plan', async () => {
    const exercise = makeLoggedExerciseSession({ plannedReps: 20 })
    exercises.items = [exercise]
    exercises.details.set(exercise.id, exercise)
    expect((await sut.execute(request)).session.repsComparison?.metPlan).toBe(
      false
    )
  })
})
