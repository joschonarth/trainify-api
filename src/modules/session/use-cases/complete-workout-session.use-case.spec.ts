import { type ExerciseLog, WorkoutSessionStatus } from 'generated/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type { UnlockAllBadgesUseCase } from '@/modules/gamification/use-cases/unlock-all-badges.use-case'
import type { UpdateUserStreakUseCase } from '@/modules/gamification/use-cases/update-user-streak.use-case'
import type {
  ExerciseSessionsRepository,
  ExerciseSessionWithLogs,
} from '@/modules/session/repositories/exercise-sessions.repository'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'

import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { CompleteWorkoutSessionUseCase } from './complete-workout-session.use-case'

const userId = 'user-id'
const sessionId = 'workout-session-id'

let exerciseSessions: ExerciseSessionWithLogs[]
let workoutSession: WorkoutSessionWithWorkout
let workoutSessionsRepository: Pick<
  WorkoutSessionsRepository,
  'findByIdWithWorkout' | 'update' | 'updateStatus'
>
let exerciseSessionsRepository: Pick<
  ExerciseSessionsRepository,
  'findByWorkoutSessionId' | 'update'
>
let exerciseLogsRepository: Pick<ExerciseLogsRepository, 'create'>
let updateUserStreakUseCase: Pick<UpdateUserStreakUseCase, 'execute'>
let unlockAllBadgesUseCase: Pick<UnlockAllBadgesUseCase, 'execute'>
let sut: CompleteWorkoutSessionUseCase

function makeExerciseSession(
  overrides: Partial<ExerciseSessionWithLogs> = {}
): ExerciseSessionWithLogs {
  return {
    id: 'exercise-session-id',
    completed: false,
    plannedSets: null,
    plannedReps: null,
    plannedWeight: null,
    startedAt: null,
    endedAt: null,
    duration: null,
    workoutSessionId: sessionId,
    exerciseId: 'exercise-id',
    exercise: {
      id: 'exercise-id',
      name: 'Bench Press',
      category: null,
      type: null,
    },
    logs: [],
    ...overrides,
  }
}

function makeExerciseLog(): ExerciseLog {
  return {
    id: 'exercise-log-id',
    sets: 3,
    reps: 10,
    weight: 20,
    volume: 600,
    description: null,
    date: new Date('2026-01-01T00:00:00.000Z'),
    exerciseSessionId: 'exercise-session-id',
    userId,
    exerciseId: 'exercise-id',
  }
}

function getFirstExerciseSession(): ExerciseSessionWithLogs {
  const exerciseSession = exerciseSessions[0]
  if (!exerciseSession) {
    throw new Error('Test exercise session is missing.')
  }
  return exerciseSession
}

describe('CompleteWorkoutSessionUseCase', () => {
  beforeEach(() => {
    exerciseSessions = [makeExerciseSession()]

    workoutSession = {
      id: sessionId,
      date: new Date('2026-01-01T00:00:00.000Z'),
      status: WorkoutSessionStatus.IN_PROGRESS,
      startedAt: null,
      endedAt: null,
      duration: null,
      userId,
      workoutId: 'workout-id',
      workout: {
        id: 'workout-id',
        name: 'Workout',
        exercises: [],
      },
      exerciseSessions: [],
    }

    const findByIdWithWorkout: WorkoutSessionsRepository['findByIdWithWorkout'] =
      async () => workoutSession
    const updateWorkoutSession: WorkoutSessionsRepository['update'] = (
      _id,
      data
    ) => {
      if (data.endedAt instanceof Date) {
        workoutSession.endedAt = data.endedAt
      }
      if (typeof data.duration === 'number') {
        workoutSession.duration = data.duration
      }
      if (typeof data.status === 'string') {
        workoutSession.status = data.status
      }
      return Promise.resolve(workoutSession)
    }
    const updateWorkoutSessionStatus: WorkoutSessionsRepository['updateStatus'] =
      (_id, status) => {
        workoutSession.status = status
        return Promise.resolve(workoutSession)
      }

    workoutSessionsRepository = {
      findByIdWithWorkout: vi.fn(findByIdWithWorkout),
      update: vi.fn(updateWorkoutSession),
      updateStatus: vi.fn(updateWorkoutSessionStatus),
    }

    const findByWorkoutSessionId: ExerciseSessionsRepository['findByWorkoutSessionId'] =
      async () => exerciseSessions
    const updateExerciseSession: ExerciseSessionsRepository['update'] = (
      id,
      data
    ) => {
      const exerciseSession = exerciseSessions.find((item) => item.id === id)
      if (!exerciseSession) {
        return Promise.reject(new Error('Exercise session not found.'))
      }
      if (typeof data.completed === 'boolean') {
        exerciseSession.completed = data.completed
      }
      return Promise.resolve(exerciseSession)
    }

    exerciseSessionsRepository = {
      findByWorkoutSessionId: vi.fn(findByWorkoutSessionId),
      update: vi.fn(updateExerciseSession),
    }

    const createExerciseLog: ExerciseLogsRepository['create'] = async () =>
      makeExerciseLog()
    exerciseLogsRepository = {
      create: vi.fn(createExerciseLog),
    }

    const updateStreak: UpdateUserStreakUseCase['execute'] = async () => ({
      currentStreak: 1,
      bestStreak: 1,
      lastWorkout: null,
    })
    updateUserStreakUseCase = {
      execute: vi.fn(updateStreak),
    }

    const unlockBadges: UnlockAllBadgesUseCase['execute'] = async () => ({
      badges: [],
    })
    unlockAllBadgesUseCase = {
      execute: vi.fn(unlockBadges),
    }

    sut = new CompleteWorkoutSessionUseCase(
      workoutSessionsRepository,
      exerciseSessionsRepository,
      exerciseLogsRepository,
      updateUserStreakUseCase,
      unlockAllBadgesUseCase
    )
  })

  it('does not create exercise logs for exercises that were not completed', async () => {
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          weight: 20,
          completed: false,
        },
      ],
    })

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(exerciseSessionsRepository.update).toHaveBeenCalledWith(
      'exercise-session-id',
      { completed: false }
    )
  })

  it('creates at most one log for each completed ExerciseSession', async () => {
    const completedExercise = {
      exerciseSessionId: 'exercise-session-id',
      sets: 3,
      reps: 10,
      weight: 20,
      completed: true,
    }

    await sut.execute({
      userId,
      sessionId,
      exercises: [completedExercise, completedExercise],
    })

    expect(exerciseLogsRepository.create).toHaveBeenCalledTimes(1)
  })

  it('does not create another log for an ExerciseSession that already has one', async () => {
    getFirstExerciseSession().logs.push(makeExerciseLog())

    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          weight: 20,
          completed: true,
        },
      ],
    })

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
  })

  it('persists zero volume when a completed exercise has no weight', async () => {
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    })

    expect(exerciseLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        weight: null,
        volume: 0,
      })
    )
  })

  it('rejects completing an already completed workout session before any writes', async () => {
    workoutSession.status = WorkoutSessionStatus.COMPLETED

    await expect(
      sut.execute({ userId, sessionId, exercises: [] })
    ).rejects.toBeInstanceOf(WorkoutSessionAlreadyCompletedError)

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(exerciseSessionsRepository.update).not.toHaveBeenCalled()
    expect(workoutSessionsRepository.update).not.toHaveBeenCalled()
    expect(workoutSessionsRepository.updateStatus).not.toHaveBeenCalled()
  })
})
