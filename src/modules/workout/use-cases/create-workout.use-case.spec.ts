import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { CreateWorkoutUseCase } from './create-workout.use-case'

describe('CreateWorkoutUseCase', () => {
  let repository: InMemoryWorkoutsRepository
  let sut: CreateWorkoutUseCase

  beforeEach(() => {
    repository = new InMemoryWorkoutsRepository()
    sut = new CreateWorkoutUseCase(repository)
  })

  it('creates a workout with an optional description', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      name: 'Leg day',
      description: null,
    })
    expect(result.workout.description).toBeNull()
  })

  it('returns a conflict when the user already has a workout with that name', async () => {
    await sut.execute({ userId: 'user-1', name: 'Leg day', description: null })
    await expect(
      sut.execute({ userId: 'user-1', name: 'Leg day', description: null })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
