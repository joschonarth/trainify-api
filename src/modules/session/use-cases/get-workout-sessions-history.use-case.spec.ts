import { WorkoutSessionStatus } from 'generated/prisma'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { makeExercise } from '@/modules/exercise/tests/factories/make-exercise'
import { InMemoryWorkoutsRepository } from '@/modules/workout/repositories/in-memory/in-memory-workouts.repository'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import type { WorkoutSessionWithWorkout } from '../repositories/workout-sessions.repository'
import { makeWorkoutHistorySession } from '../tests/factories/make-workout-history-session'
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
          measurement: 'REPS',
        },
        logs: [
          {
            id: 'log-1',
            sets: 3,
            reps: 15,
            weight: 10,
            volume: 450,
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
          measurement: 'REPS',
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
    let requestedSkip = -1
    const toHistoryRecord = (session: WorkoutSessionWithWorkout) => ({
      id: session.id,
      date: session.date,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.duration,
      workout: {
        name: session.workout.name,
        exercises: session.workout.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          position: exercise.position,
        })),
      },
      exerciseSessions: session.exerciseSessions.map((exerciseSession) => ({
        id: exerciseSession.id,
        exerciseId: exerciseSession.exercise.id,
        position: 0,
        plannedSets: exerciseSession.plannedSets,
        plannedReps: exerciseSession.plannedReps,
        plannedWeight: exerciseSession.plannedWeight,
        completed: exerciseSession.completed,
        skipReason: exerciseSession.skipReason,
        startedAt: exerciseSession.startedAt,
        endedAt: exerciseSession.endedAt,
        duration: exerciseSession.duration,
        exercise: { name: exerciseSession.exercise.name },
        logs: exerciseSession.logs.map((log) => ({
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          description: log.description,
        })),
      })),
    })
    const sut = new GetWorkoutSessionsHistoryUseCase({
      findHistoryByUser: ({ skip, take }) => {
        requestedSkip = skip
        expect(take).toBe(20)
        return Promise.resolve({
          sessions: [
            toHistoryRecord(endedSession),
            toHistoryRecord(openSession),
          ],
          total: 2,
        })
      },
    })

    const { sessions, total, totalPages } = await sut.execute({
      userId: 'user-id',
      page: 1,
      pageSize: 20,
    })

    expect(requestedSkip).toBe(0)
    expect(total).toBe(2)
    expect(totalPages).toBe(1)
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

describe('GetWorkoutSessionsHistoryUseCase pagination and filtering', () => {
  let sessions: InMemoryWorkoutSessionsRepository
  let sut: GetWorkoutSessionsHistoryUseCase
  beforeEach(async () => {
    sessions = new InMemoryWorkoutSessionsRepository()
    const workout = await new InMemoryWorkoutsRepository().create({
      id: 'workout',
      name: 'Workout',
      user: { connect: { id: 'user' } },
    })
    const exercise = await makeExercise(new InMemoryExercisesRepository())
    for (let day = 1; day <= 3; day += 1) {
      sessions.historyItems.push({
        ...makeWorkoutHistorySession(workout, exercise),
        id: String(day),
        date: new Date(2026, 0, day, 12),
        status: day === 2 ? 'INCOMPLETE' : 'COMPLETED',
      })
    }
    sessions.historyItems.push({
      ...makeWorkoutHistorySession(workout, exercise),
      userId: 'other',
    })
    sut = new GetWorkoutSessionsHistoryUseCase(sessions)
  })
  it('should paginate newest-first without leaking another user history', async () => {
    const result = await sut.execute({ userId: 'user', page: 2, pageSize: 2 })
    expect(result).toMatchObject({
      page: 2,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    })
    expect(result.sessions.map((session) => session.id)).toEqual(['1'])
  })
  it('should combine status, date range and workout filters', async () => {
    const result = await sut.execute({
      userId: 'user',
      page: 1,
      pageSize: 10,
      workoutId: 'workout',
      status: 'INCOMPLETE',
      from: new Date(2026, 0, 2),
      to: new Date(2026, 0, 3),
    })
    expect(result.total).toBe(1)
    expect(result.sessions[0]?.id).toBe('2')
  })
  it('should return an empty result and zero pages for unmatched filters', async () => {
    const result = await sut.execute({
      userId: 'user',
      page: 1,
      pageSize: 10,
      workoutId: 'missing',
    })
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.sessions).toEqual([])
  })
})
