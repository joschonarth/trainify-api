import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { makeExercise } from '../tests/factories/make-exercise'
import { AdminGlobalExercisesUseCase } from './admin-global-exercises.use-case'

let repository: InMemoryExercisesRepository
let sut: AdminGlobalExercisesUseCase

describe('Admin Global Exercises Use Case', () => {
  beforeEach(() => {
    repository = new InMemoryExercisesRepository()
    sut = new AdminGlobalExercisesUseCase(repository)
  })

  it('lists global exercises by status and excludes custom exercises', async () => {
    await makeExercise(repository, { name: 'Active global' })
    const archived = await makeExercise(repository, { name: 'Archived global' })
    await repository.archive(archived.id)
    await makeExercise(repository, {
      name: 'Custom exercise',
      isCustom: true,
      user: { connect: { id: 'owner' } },
    })

    await expect(
      sut.list({ query: '', category: null, status: 'active', page: 1 })
    ).resolves.toMatchObject({ exercises: [{ name: 'Active global' }] })
    await expect(
      sut.list({ query: '', category: null, status: 'archived', page: 1 })
    ).resolves.toMatchObject({ exercises: [{ name: 'Archived global' }] })
  })

  it('creates a global exercise without attaching it to a user', async () => {
    const result = await sut.create({
      name: '  Squat  ',
      category: 'LEGS',
      type: 'STRENGTH',
      measurement: 'REPS',
    })
    expect(result.exercise).toMatchObject({
      name: 'Squat',
      isCustom: false,
      userId: null,
    })
  })

  it('rejects duplicate global names, including archived names', async () => {
    const existing = await makeExercise(repository, { name: 'Squat' })
    await repository.archive(existing.id)
    await expect(
      sut.create({
        name: ' squat ',
        category: null,
        type: null,
        measurement: 'REPS',
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('maps a duplicate race to a conflict', async () => {
    vi.spyOn(repository, 'create').mockRejectedValue(
      Object.assign(new Error('unique'), { code: 'P2002' })
    )
    await expect(
      sut.create({
        name: 'Squat',
        category: null,
        type: null,
        measurement: 'REPS',
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('only gets global exercises and permits reading archived catalog rows', async () => {
    const global = await makeExercise(repository)
    const custom = await makeExercise(repository, {
      isCustom: true,
      user: { connect: { id: 'owner' } },
    })
    await repository.archive(global.id)
    await expect(sut.get(global.id)).resolves.toMatchObject({
      exercise: { archivedAt: expect.any(Date) },
    })
    await expect(sut.get(custom.id)).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })

  it('updates active global metadata and rejects edits to archived entries', async () => {
    const active = await makeExercise(repository)
    await expect(
      sut.update({ exerciseId: active.id, category: null })
    ).resolves.toMatchObject({ exercise: { category: null } })
    await repository.archive(active.id)
    await expect(
      sut.update({ exerciseId: active.id, name: 'Other' })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
