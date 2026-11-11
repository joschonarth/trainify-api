import { WorkoutSessionStatus } from 'generated/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'

import { createExerciseLogSessionBodySchema } from '../schemas/create-exercise-log-session.schema'
import { CreateExerciseLogSessionUseCase } from './create-exercise-log-session.use-case'

describe('CreateExerciseLogSessionUseCase', () => {
  let exerciseLogsRepository: Pick<ExerciseLogsRepository, 'create'>
  let workoutSessionsRepository: Pick<
    WorkoutSessionsRepository,
    'findByIdWithWorkout'
  >
  let sut: CreateExerciseLogSessionUseCase

  beforeEach(() => {
    const createLog: ExerciseLogsRepository['create'] = async (data) => ({
      id: 'log-id',
      sets: data.sets,
      reps: data.reps,
      weight: data.weight ?? null,
      volume: data.volume,
      description: data.description ?? null,
      date: new Date(data.date ?? new Date()),
      userId: 'user-id',
      exerciseId: 'exercise-id',
      exerciseSessionId: 'exercise-session-id',
    })
    exerciseLogsRepository = {
      create: vi.fn(createLog),
    }

    workoutSessionsRepository = {
      findByIdWithWorkout: vi.fn(async () => ({
        id: 'session-id',
        date: new Date('2026-01-01T00:00:00.000Z'),
        status: WorkoutSessionStatus.IN_PROGRESS,
        startedAt: null,
        endedAt: null,
        duration: null,
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
            plannedReps: 10,
            plannedWeight: 20,
            completed: false,
            skipReason: null,
            state: 'PENDING' as const,
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
      })),
    }

    sut = new CreateExerciseLogSessionUseCase(
      exerciseLogsRepository,
      workoutSessionsRepository
    )
  })

  it('persists the client-provided log date', async () => {
    const date = new Date('2026-02-03T10:15:00.000Z')

    await sut.execute({
      userId: 'user-id',
      sessionId: 'session-id',
      exerciseId: 'exercise-id',
      sets: 3,
      reps: 10,
      weight: 20,
      description: null,
      date,
    })

    expect(exerciseLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ date })
    )
  })

  it('persists the calculated volume with the exercise log', async () => {
    await sut.execute({
      userId: 'user-id',
      sessionId: 'session-id',
      exerciseId: 'exercise-id',
      sets: 3,
      reps: 10,
      weight: 20,
    })

    expect(exerciseLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ volume: 600 })
    )
  })

  it('validates an optional ISO-8601 date in the session log request', () => {
    const parsed = createExerciseLogSessionBodySchema.parse({
      exerciseId: 'exercise-id',
      sets: 3,
      reps: 10,
      weight: 20,
      description: null,
      date: '2026-02-03T10:15:00.000Z',
    })

    expect(parsed.date).toBe('2026-02-03T10:15:00.000Z')
    expect(
      createExerciseLogSessionBodySchema.safeParse({
        exerciseId: 'exercise-id',
        sets: 3,
        reps: 10,
        weight: 20,
        description: null,
        date: 'not-a-date',
      }).success
    ).toBe(false)
  })
})
