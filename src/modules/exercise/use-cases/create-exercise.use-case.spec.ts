import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '../repositories/in-memory/in-memory-my-exercises.repository'
import { CreateExerciseUseCase } from './create-exercise.use-case'

let exercisesRepository: InMemoryExercisesRepository
let sut: CreateExerciseUseCase

describe('CreateExerciseUseCase', () => {
  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    const myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository
    )
    sut = new CreateExerciseUseCase(exercisesRepository, myExercisesRepository)
  })

  it('maps a unique constraint race to ResourceAlreadyExistsError', async () => {
    vi.spyOn(exercisesRepository, 'create').mockRejectedValue(
      Object.assign(new Error('Unique constraint failed.'), { code: 'P2002' })
    )

    await expect(
      sut.execute({
        userId: 'user-id',
        name: 'Bench Press',
        category: 'CHEST',
        type: 'STRENGTH',
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('preserves unexpected repository errors', async () => {
    const error = new Error('Database unavailable.')
    vi.spyOn(exercisesRepository, 'create').mockRejectedValue(error)

    await expect(
      sut.execute({
        userId: 'user-id',
        name: 'Bench Press',
        category: 'CHEST',
        type: 'STRENGTH',
      })
    ).rejects.toBe(error)
  })
})
