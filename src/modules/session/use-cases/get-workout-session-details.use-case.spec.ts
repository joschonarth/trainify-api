import { WorkoutSessionStatus } from 'generated/prisma'
import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import type { WorkoutSessionWithWorkout } from '../repositories/workout-sessions.repository'
import { makeMeasuredSession } from '../tests/factories/make-measured-session'
import { GetWorkoutSessionDetailsUseCase } from './get-workout-session-details.use-case'

describe('GetWorkoutSessionDetailsUseCase', () => {
  it('returns uncompleted exercise sessions with null execution fields', async () => {
    const session: WorkoutSessionWithWorkout = {
      id: 'session-id',
      date: new Date('2026-01-01T00:00:00.000Z'),
      status: WorkoutSessionStatus.INCOMPLETE,
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      endedAt: new Date('2026-01-01T01:00:00.000Z'),
      duration: 3600,
      userId: 'user-id',
      workoutId: 'workout-id',
      workout: {
        id: 'workout-id',
        name: 'Workout',
        exercises: [],
      },
      exerciseSessions: [
        {
          id: 'exercise-session-id',
          plannedSets: 3,
          plannedReps: 12,
          plannedWeight: 20,
          completed: false,
          skipReason: 'Time ran out',
          state: 'SKIPPED',
          startedAt: null,
          endedAt: null,
          duration: null,
          exercise: {
            id: 'exercise-id',
            name: 'Bench Press',
            category: null,
            type: null,
            measurement: 'REPS',
          },
          logs: [],
        },
      ],
    }

    const sut = new GetWorkoutSessionDetailsUseCase({
      findByIdWithWorkoutAndExerciseSessions: async () => session,
    })

    const { session: details } = await sut.execute({
      userId: 'user-id',
      sessionId: 'session-id',
    })

    expect(details.exercises).toHaveLength(1)
    expect(details.exercises[0]).toMatchObject({
      completed: false,
      state: 'SKIPPED',
      skipReason: 'Time ran out',
      loggedSets: null,
      loggedReps: null,
      loggedWeight: null,
      repsComparison: null,
    })
  })
})

describe('GetWorkoutSessionDetailsUseCase ownership and execution', () => {
  let sessions: InMemoryWorkoutSessionsRepository
  let sut: GetWorkoutSessionDetailsUseCase
  beforeEach(() => {
    sessions = new InMemoryWorkoutSessionsRepository()
    sut = new GetWorkoutSessionDetailsUseCase(sessions)
  })
  it('should hide missing and foreign sessions with the same error', async () => {
    sessions.details.set(
      'session',
      makeMeasuredSession('session', new Date(), 'REPS')
    )
    await expect(
      sut.execute({ userId: 'user', sessionId: 'missing' })
    ).rejects.toEqual(new ResourceNotFoundError('Workout session not found.'))
    await expect(
      sut.execute({ userId: 'other', sessionId: 'session' })
    ).rejects.toEqual(new ResourceNotFoundError('Workout session not found.'))
  })
  it('should return stored plans and the latest logged execution', async () => {
    const session = makeMeasuredSession('session', new Date(), 'DURATION')
    const exercise = session.exerciseSessions[0]
    if (!exercise) {
      throw new Error('Missing fixture')
    }
    exercise.logs.push({
      id: 'latest',
      sets: 3,
      reps: 45,
      weight: null,
      volume: 0,
      date: new Date(),
      description: 'Latest',
    })
    sessions.details.set(session.id, session)
    const result = await sut.execute({ userId: 'user', sessionId: session.id })
    expect(result.session.exercises[0]).toMatchObject({
      plannedReps: 30,
      loggedReps: 45,
      loggedSets: 3,
      loggedWeight: null,
      description: 'Latest',
      repsComparison: { plannedReps: 30, loggedReps: 45, metPlan: true },
    })
  })
})
