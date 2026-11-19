import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { UpdateWorkoutUseCase } from './update-workout.use-case'

describe('UpdateWorkoutUseCase', () => {
  let repository: InMemoryWorkoutsRepository
  let sut: UpdateWorkoutUseCase

  beforeEach(async () => {
    repository = new InMemoryWorkoutsRepository()
    await repository.create({
      id: 'workout-1',
      name: 'Leg day',
      description: 'Heavy',
      user: { connect: { id: 'user-1' } },
    })
    await repository.create({
      id: 'workout-2',
      name: 'Push day',
      user: { connect: { id: 'user-1' } },
    })
    sut = new UpdateWorkoutUseCase(repository)
  })

  it('clears description when null is provided', async () => {
    const result = await sut.execute({
      workoutId: 'workout-1',
      userId: 'user-1',
      description: null,
    })
    expect(result.workout.description).toBeNull()
  })

  it('keeps description when the field is omitted', async () => {
    const result = await sut.execute({
      workoutId: 'workout-1',
      userId: 'user-1',
    })
    expect(result.workout.description).toBe('Heavy')
  })

  it('returns a conflict when renaming to another workout name', async () => {
    await expect(
      sut.execute({
        workoutId: 'workout-1',
        userId: 'user-1',
        name: 'Push day',
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
