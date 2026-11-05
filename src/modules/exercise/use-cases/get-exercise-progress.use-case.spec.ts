import { Measurement } from 'generated/prisma'
import { describe, expect, it, vi } from 'vitest'

import type { ExerciseLogsRepository } from '../repositories/exercise-logs.repository'
import type { GetExerciseDetailsUseCase } from './get-exercise-details.use-case'
import { GetExerciseProgressUseCase } from './get-exercise-progress.use-case'

describe('GetExerciseProgressUseCase', () => {
  it('returns zero metrics and empty progress when the exercise has no logs', async () => {
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
    const exerciseLogsRepository: Pick<
      ExerciseLogsRepository,
      'findManyByExerciseAndUser' | 'findMaxVolumeByExerciseAndUser'
    > = {
      findManyByExerciseAndUser: vi.fn(async () => []),
      findMaxVolumeByExerciseAndUser: vi.fn(),
    }
    const getExerciseDetailsUseCase: Pick<
      GetExerciseDetailsUseCase,
      'execute'
    > = {
      execute: vi.fn(async () => ({ exercise })),
    }
    const sut = new GetExerciseProgressUseCase(
      exerciseLogsRepository,
      getExerciseDetailsUseCase
    )

    await expect(
      sut.execute({ userId: 'user-id', exerciseId: 'exercise-id' })
    ).resolves.toEqual({
      exerciseId: 'exercise-id',
      exerciseName: 'Bench Press',
      totalLogs: 0,
      totalVolume: 0,
      avgVolume: 0,
      maxVolume: 0,
      maxVolumeDate: null,
      progress: [],
    })

    expect(getExerciseDetailsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      exerciseId: 'exercise-id',
    })
    expect(
      exerciseLogsRepository.findMaxVolumeByExerciseAndUser
    ).not.toHaveBeenCalled()
  })
})
