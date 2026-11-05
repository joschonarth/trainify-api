import { WorkoutSessionStatus } from 'generated/prisma'
import { describe, expect, it } from 'vitest'

import type { WorkoutSessionWithWorkout } from '../repositories/workout-sessions.repository'
import { GetWorkoutSessionsHistoryUseCase } from './get-workout-sessions-history.use-case'

function makeSession(
  overrides: Partial<WorkoutSessionWithWorkout> = {}
): WorkoutSessionWithWorkout {
  const endedAt = new Date('2026-01-01T01:00:00.000Z')

  return {
    id: 'session-id',
    date: new Date('2026-01-01T00:00:00.000Z'),
    status: WorkoutSessionStatus.INCOMPLETE,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    endedAt,
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
        id: 'completed-exercise-session',
        plannedSets: 3,
        plannedReps: 20,
        plannedWeight: 10,
        completed: true,
        skipReason: null,
        state: 'COMPLETED',
        startedAt: null,
        endedAt: null,
        duration: null,
        exercise: {
          id: 'exercise-1',
          name: 'Bench Press',
          category: null,
          type: null,
        },
        logs: [
          {
            id: 'log-1',
            sets: 3,
            reps: 15,
            weight: 10,
            date: endedAt,
            description: null,
          },
        ],
      },
      {
        id: 'skipped-exercise-session',
        plannedSets: 3,
        plannedReps: 10,
        plannedWeight: 5,
        completed: false,
        skipReason: 'Equipment unavailable',
        state: 'SKIPPED',
        startedAt: null,
        endedAt: null,
        duration: null,
        exercise: {
          id: 'exercise-2',
          name: 'Squat',
          category: null,
          type: null,
        },
        logs: [],
      },
    ],
    ...overrides,
  }
}

describe('GetWorkoutSessionsHistoryUseCase', () => {
  it('returns all exercise sessions and separates completion from achieved reps', async () => {
    const endedSession = makeSession()
    const skippedExerciseSession = endedSession.exerciseSessions.find(
      (exerciseSession) => exerciseSession.id === 'skipped-exercise-session'
    )
    if (!skippedExerciseSession) {
      throw new Error('Skipped exercise fixture is missing.')
    }
    const openSession = makeSession({
      id: 'open-session-id',
      status: WorkoutSessionStatus.IN_PROGRESS,
      endedAt: null,
      exerciseSessions: [
        {
          ...skippedExerciseSession,
          id: 'pending-exercise-session',
          skipReason: null,
          state: 'PENDING',
        },
      ],
    })
    const sut = new GetWorkoutSessionsHistoryUseCase({
      findAllByUser: async () => [endedSession, openSession],
    })

    const { sessions } = await sut.execute({ userId: 'user-id' })

    const [endedHistory, openHistory] = sessions
    if (!(endedHistory && openHistory)) {
      throw new Error('Session history fixtures are missing.')
    }
    expect(endedHistory.exercises).toHaveLength(2)
    expect(
      endedHistory.exercises.find((exercise) => exercise.name === 'Bench Press')
    ).toMatchObject({
      completed: true,
      state: 'COMPLETED',
      plannedReps: 20,
      loggedReps: 15,
      repsComparison: {
        plannedReps: 20,
        loggedReps: 15,
        metPlan: false,
      },
    })
    expect(
      endedHistory.exercises.find((exercise) => exercise.name === 'Squat')
    ).toMatchObject({
      completed: false,
      skipReason: 'Equipment unavailable',
      state: 'SKIPPED',
      loggedSets: null,
      loggedReps: null,
      loggedWeight: null,
      repsComparison: null,
    })
    expect(openHistory.exercises.at(0)).toMatchObject({
      completed: false,
      state: 'PENDING',
      loggedReps: null,
    })
  })
})
