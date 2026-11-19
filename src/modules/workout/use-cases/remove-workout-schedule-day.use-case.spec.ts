import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSchedulesRepository } from '../repositories/in-memory/in-memory-workout-schedules.repository'
import { RemoveWorkoutScheduleDayUseCase } from './remove-workout-schedule-day.use-case'

describe('RemoveWorkoutScheduleDayUseCase', () => {
  let schedules: InMemoryWorkoutSchedulesRepository
  let sut: RemoveWorkoutScheduleDayUseCase

  beforeEach(() => {
    schedules = new InMemoryWorkoutSchedulesRepository()
    schedules.items.push({
      id: 'schedule-1',
      workoutId: 'workout-1',
      userId: 'user-1',
      dayOfWeek: 2,
    })
    sut = new RemoveWorkoutScheduleDayUseCase(schedules)
  })

  it('removes a schedule owned by the user', async () => {
    await sut.execute({
      userId: 'user-1',
      workoutId: 'workout-1',
      scheduleId: 'schedule-1',
    })
    expect(schedules.items).toEqual([])
  })

  it('does not remove another user schedule', async () => {
    await expect(
      sut.execute({
        userId: 'other-user',
        workoutId: 'workout-1',
        scheduleId: 'schedule-1',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
    expect(schedules.items).toHaveLength(1)
  })

  it('returns not found for a schedule attached to another workout', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        workoutId: 'other-workout',
        scheduleId: 'schedule-1',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
