import type { Exercise, MyExercise } from 'generated/prisma'
import { describe, expect, it, vi } from 'vitest'

import { InMemoryWorkoutExercisesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-exercises.repository'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '../repositories/in-memory/in-memory-my-exercises.repository'
import type { MyExercisesRepository } from '../repositories/my-exercises.repository'
import { fetchMyExercisesQuerySchema } from '../schemas/fetch-my-exercises.schema'
import { FetchMyExercisesUseCase } from './fetch-my-exercises.use-case'

describe('FetchMyExercisesUseCase', () => {
  it('defaults pagination and caps page size at 50', () => {
    expect(fetchMyExercisesQuerySchema.parse({})).toMatchObject({
      q: '',
      page: 1,
      pageSize: 20,
    })
    expect(
      fetchMyExercisesQuerySchema.safeParse({ pageSize: 51 }).success
    ).toBe(false)
  })

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
        findAllByUser: vi.fn(async () => ({
          items: [{ ...myExercise, exercise }],
          total: 1,
        })),
      }
    const sut = new FetchMyExercisesUseCase(myExercisesRepository)

    await expect(
      sut.execute({
        userId: 'user-id',
        q: '',
        category: null,
        type: null,
        page: 1,
        pageSize: 20,
      })
    ).resolves.toEqual({
      items: [
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
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    })
  })

  it('returns paginated library entries and counts only active entries owned by the user', async () => {
    const exercisesRepository = new InMemoryExercisesRepository()
    const workoutExercisesRepository = new InMemoryWorkoutExercisesRepository(
      exercisesRepository
    )
    const myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      workoutExercisesRepository
    )

    for (let index = 0; index < 21; index += 1) {
      const exercise = await exercisesRepository.create({
        name: `Exercise ${index.toString().padStart(2, '0')}`,
        user: { connect: { id: 'user-id' } },
      })
      await myExercisesRepository.addExercise('user-id', exercise.id)
    }

    const archivedExercise = await exercisesRepository.create({
      name: 'Archived Exercise',
      archivedAt: new Date(),
      user: { connect: { id: 'user-id' } },
    })
    await myExercisesRepository.addExercise('user-id', archivedExercise.id)

    const otherUserExercise = await exercisesRepository.create({
      name: 'Other User Exercise',
      user: { connect: { id: 'other-user-id' } },
    })
    await myExercisesRepository.addExercise(
      'other-user-id',
      otherUserExercise.id
    )

    const sut = new FetchMyExercisesUseCase(myExercisesRepository)

    await expect(
      sut.execute({
        userId: 'user-id',
        q: '',
        category: null,
        type: null,
        page: 2,
        pageSize: 20,
      })
    ).resolves.toMatchObject({
      items: [{ name: 'Exercise 20' }],
      page: 2,
      pageSize: 20,
      total: 21,
      totalPages: 2,
    })
  })

  it('combines name, category and type filters before counting and paginating', async () => {
    const exercisesRepository = new InMemoryExercisesRepository()
    const workoutExercisesRepository = new InMemoryWorkoutExercisesRepository(
      exercisesRepository
    )
    const myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      workoutExercisesRepository
    )
    const matchingExercise = await exercisesRepository.create({
      name: 'Incline Bench Press',
      category: 'CHEST',
      type: 'STRENGTH',
    })
    const exercises = [
      matchingExercise,
      await exercisesRepository.create({
        name: 'Incline Row',
        category: 'BACK',
        type: 'STRENGTH',
      }),
      await exercisesRepository.create({
        name: 'Incline Treadmill',
        category: 'CHEST',
        type: 'CARDIO',
      }),
      await exercisesRepository.create({
        name: 'Bench Press',
        category: 'CHEST',
        type: 'STRENGTH',
      }),
    ]

    for (const exercise of exercises) {
      await myExercisesRepository.addExercise('user-id', exercise.id)
    }

    const sut = new FetchMyExercisesUseCase(myExercisesRepository)

    await expect(
      sut.execute({
        userId: 'user-id',
        q: 'incline',
        category: 'CHEST',
        type: 'STRENGTH',
        page: 1,
        pageSize: 1,
      })
    ).resolves.toMatchObject({
      items: [{ exerciseId: matchingExercise.id, name: 'Incline Bench Press' }],
      page: 1,
      pageSize: 1,
      total: 1,
      totalPages: 1,
    })
  })
})
