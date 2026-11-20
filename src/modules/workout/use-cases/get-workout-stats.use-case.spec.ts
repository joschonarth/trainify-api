import { beforeEach, describe, expect, it } from 'vitest'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { GetWorkoutStatsUseCase } from './get-workout-stats.use-case'

function makeSession(
  status: 'COMPLETED' | 'INCOMPLETE',
  volume: number,
  id: string
) {
  return {
    id,
    status,
    date: new Date('2026-01-01T12:00:00.000Z'),
    exerciseSessions: [
      {
        completed: true,
        exercise: { measurement: 'REPS' },
        logs: [{ volume, sets: 2, reps: 5, weight: 10 }],
      },
    ],
  } as unknown as WorkoutSessionWithWorkout
}

describe('GetWorkoutStatsUseCase', () => {
  let workouts: InMemoryWorkoutsRepository
  let sessions: WorkoutSessionsRepository
  let sessionItems: WorkoutSessionWithWorkout[]
  let sut: GetWorkoutStatsUseCase

  beforeEach(async () => {
    workouts = new InMemoryWorkoutsRepository()
    await workouts.create({
      id: 'workout-1',
      name: 'Strength',
      user: { connect: { id: 'user-1' } },
    })
    sessionItems = []
    sessions = {
      findManyByWorkoutAndUser: async () => sessionItems,
    } as unknown as WorkoutSessionsRepository
    sut = new GetWorkoutStatsUseCase(workouts, sessions)
  })

  it('returns zero stats when the workout has no completed sessions', async () => {
    sessionItems = [makeSession('INCOMPLETE', 250, 'incomplete-1')]
    const result = await sut.execute({
      userId: 'user-1',
      workoutId: 'workout-1',
    })
    expect(result).toMatchObject({
      totalSessions: 0,
      totalExercises: 0,
      totalVolume: 0,
      avgVolume: 0,
      highestVolumeSession: null,
      sessions: [],
    })
  })

  it('counts completed sessions and sums the stored log volume', async () => {
    sessionItems = [
      makeSession('COMPLETED', 75, 'completed-1'),
      makeSession('INCOMPLETE', 250, 'incomplete-1'),
    ]
    const result = await sut.execute({
      userId: 'user-1',
      workoutId: 'workout-1',
    })
    expect(result.totalSessions).toBe(1)
    expect(result.totalVolume).toBe(75)
    expect(result.avgVolume).toBe(75)
    expect(result.highestVolumeSession?.totalVolume).toBe(75)
  })

  it('returns not found when the workout does not belong to the user', async () => {
    await expect(
      sut.execute({ userId: 'other-user', workoutId: 'workout-1' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
  it('should ignore legacy duration load volume while preserving strength volume', async () => {
    const duration = makeSession('COMPLETED', 99_999, 'duration')
    const exercise = duration.exerciseSessions[0]
    if (!exercise) {
      throw new Error('Missing fixture')
    }
    exercise.exercise.measurement = 'DURATION'
    sessionItems = [duration, makeSession('COMPLETED', 75, 'strength')]
    const result = await sut.execute({
      userId: 'user-1',
      workoutId: 'workout-1',
    })
    expect(result.totalVolume).toBe(75)
    expect(result.totalExercises).toBe(2)
    expect(
      result.sessions.find((session) => session.id === 'duration')?.totalVolume
    ).toBe(0)
  })
})
