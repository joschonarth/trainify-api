import { beforeEach, describe, expect, it } from 'vitest'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '../repositories/in-memory/in-memory-my-exercises.repository'
import { RemoveCatalogExerciseUseCase } from './remove-catalog-exercise.use-case'

describe('RemoveCatalogExerciseUseCase', () => {
  let myExercisesRepository: InMemoryMyExercisesRepository
  let sut: RemoveCatalogExerciseUseCase

  beforeEach(() => {
    const exercisesRepository = new InMemoryExercisesRepository()
    myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository
    )
    sut = new RemoveCatalogExerciseUseCase(myExercisesRepository)
  })

  it('removes a library entry by exercise ID for the owner', async () => {
    const entry = await myExercisesRepository.addExercise(
      'user-id',
      'exercise-id'
    )

    await sut.execute({ userId: 'user-id', exerciseId: 'exercise-id' })

    expect(await myExercisesRepository.findById(entry.id)).toBeNull()
  })

  it('does not remove another user library entry with the same exercise ID', async () => {
    const entry = await myExercisesRepository.addExercise(
      'other-user-id',
      'exercise-id'
    )

    await expect(
      sut.execute({ userId: 'user-id', exerciseId: 'exercise-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(await myExercisesRepository.findById(entry.id)).not.toBeNull()
  })
})
