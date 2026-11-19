import type { WorkoutSchedule } from 'generated/prisma'
import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import type { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'
import { UpdateWorkoutScheduleDayUseCase } from './update-workout-schedule-day.use-case'

describe('UpdateWorkoutScheduleDayUseCase', () => {
  let schedules: WorkoutSchedulesRepository
  let current: WorkoutSchedule
  let sut: UpdateWorkoutScheduleDayUseCase

  beforeEach(() => {
    current = { id: 's1', workoutId: 'w1', userId: 'u1', dayOfWeek: 1 }
    schedules = {
      findById: async () => current,
      findDaysByUser: async () => [
        current,
        { id: 's2', workoutId: 'w2', userId: 'u1', dayOfWeek: 3 },
      ],
      updateDay: (_id: string, dayOfWeek: number) => {
        current = { ...current, dayOfWeek }
        return Promise.resolve(current)
      },
    } as unknown as WorkoutSchedulesRepository
    sut = new UpdateWorkoutScheduleDayUseCase(schedules)
  })

  it('rejects a day assigned to another workout by the same user', async () => {
    await expect(
      sut.execute({
        userId: 'u1',
        workoutId: 'w1',
        scheduleId: 's1',
        newDayOfWeek: 3,
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
    expect(current.dayOfWeek).toBe(1)
  })

  it('allows changing to an unassigned day', async () => {
    const result = await sut.execute({
      userId: 'u1',
      workoutId: 'w1',
      scheduleId: 's1',
      newDayOfWeek: 4,
    })
    expect(result.schedule.dayOfWeek).toBe(4)
  })
})
