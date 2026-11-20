import type { Exercise, Workout } from 'generated/prisma'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { makeExercise } from '@/modules/exercise/tests/factories/make-exercise'
import { InMemoryWorkoutsRepository } from '@/modules/workout/repositories/in-memory/in-memory-workouts.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import {
  makeWorkoutHistoryLog,
  makeWorkoutHistorySession,
} from '../tests/factories/make-workout-history-session'
import { GetWorkoutSessionsByWorkoutUseCase } from './get-workout-sessions-by-workout.use-case'

describe('GetWorkoutSessionsByWorkoutUseCase', () => {
  let workouts: InMemoryWorkoutsRepository
  let sessions: InMemoryWorkoutSessionsRepository
  let workout: Workout
  let exercise: Exercise
  let sut: GetWorkoutSessionsByWorkoutUseCase
  const request = { userId: 'user', workoutId: 'workout' }
  beforeEach(async () => {
    workouts = new InMemoryWorkoutsRepository()
    sessions = new InMemoryWorkoutSessionsRepository()
    workout = await workouts.create({
      id: 'workout',
      name: 'Workout',
      user: { connect: { id: 'user' } },
    })
    exercise = await makeExercise(new InMemoryExercisesRepository(), {
      id: 'exercise',
    })
    sut = new GetWorkoutSessionsByWorkoutUseCase(sessions, workouts)
  })
  it('should return workout identity and empty history for an owned workout', async () => {
    expect(await sut.execute(request)).toEqual({
      workoutId: 'workout',
      workoutName: 'Workout',
      totalSessions: 0,
      sessions: [],
    })
  })
  it('should hide missing and foreign workouts with the same error', async () => {
    await expect(
      sut.execute({ ...request, workoutId: 'missing' })
    ).rejects.toEqual(new ResourceNotFoundError('Workout not found.'))
    await expect(sut.execute({ ...request, userId: 'other' })).rejects.toEqual(
      new ResourceNotFoundError('Workout not found.')
    )
  })
  it('should keep archived workouts accessible with or without history', async () => {
    await workouts.archive(workout.id)
    expect((await sut.execute(request)).totalSessions).toBe(0)
    sessions.historyItems.push(makeWorkoutHistorySession(workout, exercise))
    expect((await sut.execute(request)).totalSessions).toBe(1)
  })
  it('should use the latest log weight with stable ID tie-breaking while summing volumes', async () => {
    sessions.historyItems.push(
      makeWorkoutHistorySession(workout, exercise, [
        makeWorkoutHistoryLog({
          id: 'z-old',
          date: new Date('2025-01-01T00:00:00Z'),
          weight: 100,
          volume: 2000,
        }),
        makeWorkoutHistoryLog({ id: 'z-new', weight: 40, volume: 800 }),
        makeWorkoutHistoryLog({ id: 'a-new', weight: 20, volume: 400 }),
      ])
    )
    const result = await sut.execute(request)
    expect(result.sessions[0]?.exerciseSessions[0]).toMatchObject({
      weight: 40,
      volume: 3200,
      sets: 6,
      reps: 30,
      state: 'COMPLETED',
    })
    expect(result.sessions[0]?.totalVolume).toBe(3200)
  })
  it('should return zero weight when no logs exist or the latest log is unweighted', async () => {
    const session = makeWorkoutHistorySession(workout, exercise)
    sessions.historyItems.push(session)
    expect(
      (await sut.execute(request)).sessions[0]?.exerciseSessions[0]?.weight
    ).toBe(0)
    session.exerciseSessions[0]?.logs.push(
      makeWorkoutHistoryLog({ id: 'old', date: new Date(0), weight: 80 }),
      makeWorkoutHistoryLog({ weight: null, volume: 0 })
    )
    expect(
      (await sut.execute(request)).sessions[0]?.exerciseSessions[0]?.weight
    ).toBe(0)
  })
  it('should preserve duration volume semantics for legacy history', async () => {
    sessions.historyItems.push(
      makeWorkoutHistorySession(
        workout,
        { ...exercise, measurement: 'DURATION' },
        [makeWorkoutHistoryLog({ reps: 30, volume: 9999 })]
      )
    )
    const result = await sut.execute(request)
    expect(result.sessions[0]?.totalVolume).toBe(0)
    expect(result.sessions[0]?.exerciseSessions[0]).toMatchObject({
      reps: 30,
      weight: 20,
      volume: 0,
    })
  })
  it('should derive skipped state for omitted exercises after session completion', async () => {
    const session = makeWorkoutHistorySession(workout, exercise)
    const item = session.exerciseSessions[0]
    if (!item) {
      throw new Error('Missing fixture')
    }
    item.completed = false
    sessions.historyItems.push(session)
    expect(
      (await sut.execute(request)).sessions[0]?.exerciseSessions[0]?.state
    ).toBe('SKIPPED')
  })
})
