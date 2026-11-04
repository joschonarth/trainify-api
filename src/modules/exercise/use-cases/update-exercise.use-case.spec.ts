import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { makeExercise } from '../tests/factories/make-exercise'
import { UpdateExerciseUseCase } from './update-exercise.use-case'

let exercisesRepository: InMemoryExercisesRepository
let sut: UpdateExerciseUseCase

describe('UpdateExerciseUseCase', () => {
  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    sut = new UpdateExerciseUseCase(exercisesRepository)
  })

  it('rejects a name already used by another custom exercise of the owner', async () => {
    const owner = { connect: { id: 'user-id' } }
    const exercise = await makeExercise(exercisesRepository, {
      name: 'Bench Press',
      isCustom: true,
      user: owner,
    })
    await makeExercise(exercisesRepository, {
      name: 'Squat',
      isCustom: true,
      user: owner,
    })

    await expect(
      sut.execute({
        userId: 'user-id',
        exerciseId: exercise.id,
        name: 'SQUAT',
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('maps a unique constraint race to ResourceAlreadyExistsError', async () => {
    const exercise = await makeExercise(exercisesRepository, {
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: 'user-id' } },
    })
    vi.spyOn(exercisesRepository, 'update').mockRejectedValue(
      Object.assign(new Error('Unique constraint failed.'), { code: 'P2002' })
    )

    await expect(
      sut.execute({
        userId: 'user-id',
        exerciseId: exercise.id,
        name: 'Incline Bench Press',
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('allows clearing category and type with null', async () => {
    const exercise = await makeExercise(exercisesRepository, {
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: 'user-id' } },
    })

    const result = await sut.execute({
      userId: 'user-id',
      exerciseId: exercise.id,
      category: null,
      type: null,
    })

    expect(result.exercise.category).toBeNull()
    expect(result.exercise.type).toBeNull()
  })

  it('does not conflict with the exercise itself when its name is unchanged', async () => {
    const exercise = await makeExercise(exercisesRepository, {
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: 'user-id' } },
    })

    await expect(
      sut.execute({
        userId: 'user-id',
        exerciseId: exercise.id,
        name: 'bench press',
      })
    ).resolves.toMatchObject({ exercise: { name: 'bench press' } })
  })

  it('does not change catalog exercises', async () => {
    const exercise = await makeExercise(exercisesRepository, {
      name: 'Bench Press',
      isCustom: false,
    })

    await expect(
      sut.execute({
        userId: 'user-id',
        exerciseId: exercise.id,
        name: 'New name',
      })
    ).rejects.toBeInstanceOf(NotAllowedError)
    await expect(
      exercisesRepository.findById(exercise.id)
    ).resolves.toMatchObject({
      name: 'Bench Press',
    })
  })

  it('does not change another owner custom exercise', async () => {
    const exercise = await makeExercise(exercisesRepository, {
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: 'other-user-id' } },
    })

    await expect(
      sut.execute({
        userId: 'user-id',
        exerciseId: exercise.id,
        name: 'New name',
      })
    ).rejects.toBeInstanceOf(NotAllowedError)
    await expect(
      exercisesRepository.findById(exercise.id)
    ).resolves.toMatchObject({
      name: 'Bench Press',
    })
  })
})
