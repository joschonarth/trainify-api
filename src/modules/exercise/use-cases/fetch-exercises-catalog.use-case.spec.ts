import { describe, expect, it } from 'vitest'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { FetchExercisesCatalogUseCase } from './fetch-exercises-catalog.use-case'

describe('FetchExercisesCatalogUseCase', () => {
  it('returns an empty list when no global catalog exercises exist', async () => {
    const exercisesRepository = new InMemoryExercisesRepository()
    const sut = new FetchExercisesCatalogUseCase(exercisesRepository)

    await expect(
      sut.execute({
        query: '',
        category: null,
        page: 1,
      })
    ).resolves.toEqual({ exercises: [] })
  })

  it('returns only active global catalog exercises', async () => {
    const exercisesRepository = new InMemoryExercisesRepository()
    const globalExercise = await exercisesRepository.create({
      name: 'Global exercise',
      isCustom: false,
    })
    await exercisesRepository.create({
      name: 'Archived global exercise',
      isCustom: false,
      archivedAt: new Date(),
    })
    await exercisesRepository.create({
      name: 'User-owned non-custom exercise',
      isCustom: false,
      user: { connect: { id: 'user-id' } },
    })
    const sut = new FetchExercisesCatalogUseCase(exercisesRepository)

    await expect(
      sut.execute({
        query: '',
        category: null,
        page: 1,
      })
    ).resolves.toMatchObject({
      exercises: [{ id: globalExercise.id, name: 'Global exercise' }],
    })
  })
})
