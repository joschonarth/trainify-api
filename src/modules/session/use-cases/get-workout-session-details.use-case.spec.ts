import { WorkoutSessionStatus } from 'generated/prisma'
import { describe, expect, it } from 'vitest'

import type { WorkoutSessionWithWorkout } from '../repositories/workout-sessions.repository'
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
