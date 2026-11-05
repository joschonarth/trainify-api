import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'

import { GetUserMetricsUseCase } from './get-user-metrics.use-case'

describe('GetUserMetricsUseCase', () => {
  let workoutSessionsRepository: Pick<
    WorkoutSessionsRepository,
    'countCompletedByUser' | 'findAllByUser'
  >
  let exerciseSessionsRepository: Pick<
    ExerciseSessionsRepository,
    'countCompletedByUser'
  >
  let sut: GetUserMetricsUseCase

  beforeEach(() => {
    workoutSessionsRepository = {
      countCompletedByUser: vi.fn(async () => 4),
      findAllByUser: vi.fn(async () => []),
    }
    exerciseSessionsRepository = {
      countCompletedByUser: vi.fn(async () => 7),
    }
    sut = new GetUserMetricsUseCase(
      workoutSessionsRepository,
      exerciseSessionsRepository
    )
  })

  it('counts completed exercise sessions instead of exercise logs', async () => {
    await expect(sut.execute({ userId: 'user-id' })).resolves.toEqual({
      totalWorkouts: 4,
      totalExercises: 7,
      totalWorkoutDuration: 0,
    })

    expect(
      exerciseSessionsRepository.countCompletedByUser
    ).toHaveBeenCalledWith('user-id')
  })
})
