import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryWorkoutExercisesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-exercises.repository'
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
      exercisesRepository,
      new InMemoryWorkoutExercisesRepository(exercisesRepository)
    )
    sut = new CreateExerciseUseCase(exercisesRepository, myExercisesRepository)
  })

  it('maps a unique constraint race to ResourceAlreadyExistsError', async () => {
    const myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      new InMemoryWorkoutExercisesRepository(exercisesRepository)
    )
    vi.spyOn(
      myExercisesRepository,
      'createCustomExerciseWithLibraryEntry'
    ).mockRejectedValue(
      Object.assign(new Error('Unique constraint failed.'), { code: 'P2002' })
    )
    sut = new CreateExerciseUseCase(exercisesRepository, myExercisesRepository)

    await expect(
      sut.execute({
        userId: 'user-id',
        name: 'Bench Press',
        category: 'CHEST',
        type: 'STRENGTH',
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('adds a created custom exercise to the user library', async () => {
    const myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      new InMemoryWorkoutExercisesRepository(exercisesRepository)
    )
    sut = new CreateExerciseUseCase(exercisesRepository, myExercisesRepository)

    const { exercise } = await sut.execute({
      userId: 'user-id',
      name: 'Bench Press',
      category: 'CHEST',
      type: 'STRENGTH',
    })

    const { items: libraryEntries } = await myExercisesRepository.findAllByUser(
      'user-id',
      '',
      null,
      1,
      20
    )

    expect(libraryEntries).toHaveLength(1)
    expect(libraryEntries[0]?.exercise.id).toBe(exercise.id)
  })

  it('rolls back a custom exercise when its library entry cannot be created', async () => {
    const myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      new InMemoryWorkoutExercisesRepository(exercisesRepository)
    )
    vi.spyOn(myExercisesRepository, 'addExercise').mockRejectedValue(
      new Error('Library insert failed.')
    )
    sut = new CreateExerciseUseCase(exercisesRepository, myExercisesRepository)

    await expect(
      sut.execute({
        userId: 'user-id',
        name: 'Bench Press',
        category: 'CHEST',
        type: 'STRENGTH',
      })
    ).rejects.toThrow('Library insert failed.')

    expect(exercisesRepository.items).toHaveLength(0)
    expect(myExercisesRepository.items).toHaveLength(0)
  })

  it('preserves unexpected repository errors', async () => {
    const myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      new InMemoryWorkoutExercisesRepository(exercisesRepository)
    )
    const error = new Error('Database unavailable.')
    vi.spyOn(
      myExercisesRepository,
      'createCustomExerciseWithLibraryEntry'
    ).mockRejectedValue(error)
    sut = new CreateExerciseUseCase(exercisesRepository, myExercisesRepository)

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
