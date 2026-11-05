import type { Exercise, MyExercise } from 'generated/prisma'
import { describe, expect, it, vi } from 'vitest'

import type { MyExercisesRepository } from '../repositories/my-exercises.repository'
import { FetchMyExercisesUseCase } from './fetch-my-exercises.use-case'

describe('FetchMyExercisesUseCase', () => {
  it('returns the library entry creation date', async () => {
    const exerciseCreatedAt = new Date('2026-01-01T00:00:00.000Z')
    const libraryAddedAt = new Date('2026-02-01T00:00:00.000Z')
    const exercise: Exercise = {
      id: 'exercise-id',
      name: 'Bench Press',
      category: 'CHEST',
      type: 'STRENGTH',
      measurement: 'REPS',
      isCustom: true,
      createdAt: exerciseCreatedAt,
      updatedAt: exerciseCreatedAt,
      archivedAt: null,
      userId: 'user-id',
    }
    const myExercise: MyExercise = {
      id: 'my-exercise-id',
      createdAt: libraryAddedAt,
      userId: 'user-id',
      exerciseId: exercise.id,
    }
    const myExercisesRepository: Pick<MyExercisesRepository, 'findAllByUser'> =
      {
        findAllByUser: vi.fn(async () => [{ ...myExercise, exercise }]),
      }
    const sut = new FetchMyExercisesUseCase(myExercisesRepository)

    await expect(
      sut.execute({
        userId: 'user-id',
        query: '',
        category: null,
        page: 1,
      })
    ).resolves.toEqual({
      myExercises: [
        {
          myExerciseId: myExercise.id,
          exerciseId: exercise.id,
          name: exercise.name,
          category: exercise.category,
          type: exercise.type,
          isCustom: exercise.isCustom,
          createdAt: libraryAddedAt,
          userId: exercise.userId,
        },
      ],
    })
  })
})
