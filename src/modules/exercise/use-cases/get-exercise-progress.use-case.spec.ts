import { Measurement } from 'generated/prisma'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import { calculateVolume } from '@/shared/utils/calculate-volume'

import type { GetExerciseDetailsUseCase } from './get-exercise-details.use-case'
import { GetExerciseProgressUseCase } from './get-exercise-progress.use-case'

describe('calculateVolume', () => {
  it('treats a null weight as zero', () => {
    expect(calculateVolume(3, 10, null)).toBe(0)
  })

  it('returns zero for a zero weight', () => {
    expect(calculateVolume(3, 10, 0)).toBe(0)
  })

  it('preserves fractional weights', () => {
    expect(calculateVolume(3, 10, 2.5)).toBe(75)
  })
})

describe('GetExerciseProgressUseCase', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const exercise = {
    id: 'exercise-id',
    name: 'Bench Press',
    category: null,
    type: null,
    measurement: Measurement.REPS,
    isCustom: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    archivedAt: null,
    userId: null,
  }

  function makeSession(
    id: string,
    startedAt: Date,
    duration: number,
    logs: {
      id: string
      sets: number
      reps: number
      weight: number | null
      volume: number
      date: Date
      description: string | null
    }[]
  ) {
    return {
      id,
      completed: true,
      plannedSets: null,
      plannedReps: null,
      plannedWeight: null,
      skipReason: null,
      startedAt,
      endedAt: new Date(startedAt.getTime() + duration * 1000),
      duration,
      workoutSessionId: `workout-${id}`,
      exerciseId: 'exercise-id',
      exercise: {
        id: 'exercise-id',
        name: 'Bench Press',
        category: null,
        type: null,
      },
      logs,
    }
  }

  function makeSut(sessions: ReturnType<typeof makeSession>[] = []) {
    const exerciseSessionsRepository: Pick<
      ExerciseSessionsRepository,
      'findManyByUserAndExercise'
    > = {
      findManyByUserAndExercise: vi.fn(async (_userId, _exerciseId, fromDate) =>
        sessions.filter((session) => !fromDate || session.startedAt >= fromDate)
      ),
    }
    const getExerciseDetailsUseCase: Pick<
      GetExerciseDetailsUseCase,
      'execute'
    > = {
      execute: vi.fn(async () => ({ exercise })),
    }
    const sut = new GetExerciseProgressUseCase(
      exerciseSessionsRepository,
      getExerciseDetailsUseCase
    )

    return { sut, exerciseSessionsRepository, getExerciseDetailsUseCase }
  }

  it('returns zero metrics and empty progress when the exercise has no logs', async () => {
    const { sut, exerciseSessionsRepository, getExerciseDetailsUseCase } =
      makeSut()

    await expect(
      sut.execute({ userId: 'user-id', exerciseId: 'exercise-id' })
    ).resolves.toEqual({
      exerciseId: 'exercise-id',
      exerciseName: 'Bench Press',
      totalLogs: 0,
      totalSessions: 0,
      totalVolume: 0,
      avgVolume: 0,
      maxVolume: 0,
      maxVolumeDate: null,
      totalSets: 0,
      avgSets: 0,
      maxSets: 0,
      totalReps: 0,
      avgReps: 0,
      maxReps: 0,
      totalWeight: 0,
      avgWeight: 0,
      maxWeight: 0,
      totalDuration: 0,
      avgDuration: 0,
      progress: [],
    })

    expect(getExerciseDetailsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      exerciseId: 'exercise-id',
    })
    expect(
      exerciseSessionsRepository.findManyByUserAndExercise
    ).toHaveBeenCalledWith('user-id', 'exercise-id', undefined)
  })

  it('aggregates log values and returns progress grouped chronologically by session', async () => {
    const firstSessionDate = new Date('2026-11-09T10:00:00.000Z')
    const secondSessionDate = new Date('2026-11-10T10:00:00.000Z')
    const { sut } = makeSut([
      makeSession('second-session', secondSessionDate, 120, [
        {
          id: 'log-2',
          sets: 3,
          reps: 10,
          weight: 20,
          volume: 600,
          date: secondSessionDate,
          description: null,
        },
        {
          id: 'log-3',
          sets: 2,
          reps: 5,
          weight: null,
          volume: 0,
          date: new Date('2026-11-10T10:10:00.000Z'),
          description: 'bodyweight',
        },
      ]),
      makeSession('first-session', firstSessionDate, 60, [
        {
          id: 'log-1',
          sets: 1,
          reps: 10,
          weight: 10,
          volume: 100,
          date: firstSessionDate,
          description: null,
        },
      ]),
    ])

    const result = await sut.execute({
      userId: 'user-id',
      exerciseId: 'exercise-id',
    })

    expect(result).toMatchObject({
      totalLogs: 3,
      totalSessions: 2,
      totalVolume: 700,
      avgVolume: 350,
      maxVolume: 600,
      maxVolumeDate: secondSessionDate,
      totalSets: 6,
      avgSets: 3,
      maxSets: 5,
      totalReps: 25,
      avgReps: 12.5,
      maxReps: 15,
      totalWeight: 30,
      avgWeight: 15,
      maxWeight: 20,
      totalDuration: 180,
      avgDuration: 90,
    })
    expect(result.progress).toEqual([
      expect.objectContaining({
        sessionId: 'first-session',
        date: firstSessionDate,
        totalVolume: 100,
        totalSets: 1,
        totalReps: 10,
        totalWeight: 10,
        logs: [expect.objectContaining({ id: 'log-1', volume: 100 })],
      }),
      expect.objectContaining({
        sessionId: 'second-session',
        date: secondSessionDate,
        totalVolume: 600,
        totalSets: 5,
        totalReps: 15,
        totalWeight: 20,
        logs: [
          expect.objectContaining({ id: 'log-2', volume: 600 }),
          expect.objectContaining({ id: 'log-3', volume: 0 }),
        ],
      }),
    ])
  })

  it('filters session aggregates by the requested period', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-11T12:00:00.000Z'))
    const { sut, exerciseSessionsRepository } = makeSut([
      makeSession('week-session', new Date('2026-11-06T12:00:00.000Z'), 10, [
        {
          id: 'week-log',
          sets: 1,
          reps: 1,
          weight: 10,
          volume: 10,
          date: new Date('2026-11-06T12:00:00.000Z'),
          description: null,
        },
      ]),
      makeSession('month-session', new Date('2026-10-22T12:00:00.000Z'), 10, [
        {
          id: 'month-log',
          sets: 1,
          reps: 1,
          weight: 20,
          volume: 20,
          date: new Date('2026-10-22T12:00:00.000Z'),
          description: null,
        },
      ]),
      makeSession('all-session', new Date('2026-10-02T12:00:00.000Z'), 10, [
        {
          id: 'all-log',
          sets: 1,
          reps: 1,
          weight: 40,
          volume: 40,
          date: new Date('2026-10-02T12:00:00.000Z'),
          description: null,
        },
      ]),
    ])

    const week = await sut.execute({
      userId: 'user-id',
      exerciseId: 'exercise-id',
      period: 'WEEK',
    })
    const month = await sut.execute({
      userId: 'user-id',
      exerciseId: 'exercise-id',
      period: 'MONTH',
    })
    const all = await sut.execute({
      userId: 'user-id',
      exerciseId: 'exercise-id',
      period: 'ALL',
    })

    expect(week).toMatchObject({ totalSessions: 1, totalVolume: 10 })
    expect(month).toMatchObject({ totalSessions: 2, totalVolume: 30 })
    expect(all).toMatchObject({ totalSessions: 3, totalVolume: 70 })
    expect(
      exerciseSessionsRepository.findManyByUserAndExercise
    ).toHaveBeenNthCalledWith(
      1,
      'user-id',
      'exercise-id',
      new Date('2026-11-04T12:00:00.000Z')
    )
    expect(
      exerciseSessionsRepository.findManyByUserAndExercise
    ).toHaveBeenNthCalledWith(
      2,
      'user-id',
      'exercise-id',
      new Date('2026-10-12T12:00:00.000Z')
    )
    expect(
      exerciseSessionsRepository.findManyByUserAndExercise
    ).toHaveBeenNthCalledWith(3, 'user-id', 'exercise-id', undefined)
  })
})
