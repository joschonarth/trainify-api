import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { InMemoryWorkoutSchedulesRepository } from '../repositories/in-memory/in-memory-workout-schedules.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { AssignDaysToWorkoutUseCase } from './assign-days-to-workout.use-case'

describe('AssignDaysToWorkoutUseCase', () => {
  let workouts: InMemoryWorkoutsRepository
  let schedules: InMemoryWorkoutSchedulesRepository
  let sut: AssignDaysToWorkoutUseCase

  beforeEach(async () => {
    workouts = new InMemoryWorkoutsRepository()
    await workouts.create({
      id: 'w1',
      name: 'A',
      user: { connect: { id: 'u1' } },
    })
    schedules = new InMemoryWorkoutSchedulesRepository()
    schedules.items.push(
      { id: 's1', userId: 'u1', workoutId: 'w1', dayOfWeek: 2 },
      { id: 's2', userId: 'u1', workoutId: 'w2', dayOfWeek: 3 }
    )
    sut = new AssignDaysToWorkoutUseCase(workouts, schedules)
  })

  it('replaces the assigned days', async () => {
    await sut.execute({ workoutId: 'w1', userId: 'u1', daysOfWeek: [0, 6] })
    expect(
      (await schedules.findDaysByWorkout('w1')).map((day) => day.dayOfWeek)
    ).toEqual([0, 6])
  })

  it('preserves previous days when another workout owns a requested day', async () => {
    await expect(
      sut.execute({ workoutId: 'w1', userId: 'u1', daysOfWeek: [3] })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
    expect(
      (await schedules.findDaysByWorkout('w1')).map((day) => day.dayOfWeek)
    ).toEqual([2])
  })

  it('rejects duplicate days before replacing the schedule', async () => {
    await expect(
      sut.execute({ workoutId: 'w1', userId: 'u1', daysOfWeek: [1, 1] })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
    expect(
      (await schedules.findDaysByWorkout('w1')).map((day) => day.dayOfWeek)
    ).toEqual([2])
  })
  it('rejects a workout that becomes unavailable after the initial ownership read', async () => {
    schedules.unavailableWorkouts.add('w1')
    const before = structuredClone(schedules.items)
    await expect(
      sut.execute({ workoutId: 'w1', userId: 'u1', daysOfWeek: [4] })
    ).rejects.toMatchObject({ statusCode: 404, message: 'Workout not found.' })
    expect(schedules.items).toEqual(before)
  })
})
