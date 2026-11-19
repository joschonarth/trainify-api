import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSchedulesRepository } from '../repositories/in-memory/in-memory-workout-schedules.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { FetchWorkoutSchedulesUseCase } from './fetch-workout-schedules.use-case'

describe('FetchWorkoutSchedulesUseCase', () => {
  let workouts: InMemoryWorkoutsRepository
  let schedules: InMemoryWorkoutSchedulesRepository
  let sut: FetchWorkoutSchedulesUseCase

  beforeEach(async () => {
    workouts = new InMemoryWorkoutsRepository()
    await workouts.create({
      id: 'workout-1',
      name: 'Strength',
      user: { connect: { id: 'user-1' } },
    })
    schedules = new InMemoryWorkoutSchedulesRepository()
    schedules.items.push({
      id: 'schedule-1',
      workoutId: 'workout-1',
      userId: 'user-1',
      dayOfWeek: 2,
    })
    sut = new FetchWorkoutSchedulesUseCase(workouts, schedules)
  })

  it('returns schedules for an owned workout', async () => {
    const result = await sut.execute({
      workoutId: 'workout-1',
      userId: 'user-1',
    })
    expect(result.schedules).toEqual([schedules.items[0]])
  })

  it('hides workouts that do not belong to the user', async () => {
    await expect(
      sut.execute({ workoutId: 'workout-1', userId: 'other-user' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
