import { beforeEach, describe, expect, it } from 'vitest'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { GetExerciseDetailsUseCase } from './get-exercise-details.use-case'

describe('GetExerciseDetailsUseCase', () => {
  let exercisesRepository: InMemoryExercisesRepository
  let sut: GetExerciseDetailsUseCase

  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    sut = new GetExerciseDetailsUseCase(exercisesRepository)
  })

  it('returns not found for an archived exercise', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: true,
      archivedAt: new Date(),
      user: { connect: { id: 'user-id' } },
    })

    await expect(
      sut.execute({ exerciseId: exercise.id, userId: 'user-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
