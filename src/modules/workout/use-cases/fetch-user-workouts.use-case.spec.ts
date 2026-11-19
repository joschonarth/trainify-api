import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { FetchUserWorkoutsUseCase } from './fetch-user-workouts.use-case'

describe('FetchUserWorkoutsUseCase', () => {
  let repository: InMemoryWorkoutsRepository
  let sut: FetchUserWorkoutsUseCase

  beforeEach(async () => {
    repository = new InMemoryWorkoutsRepository()
    await repository.create({
      id: 'a',
      name: 'Upper Body',
      user: { connect: { id: 'u1' } },
    })
    await repository.create({
      id: 'b',
      name: 'Leg Day',
      user: { connect: { id: 'u1' } },
    })
    await repository.create({
      id: 'c',
      name: 'Upper Power',
      user: { connect: { id: 'u1' } },
    })
    await repository.create({
      id: 'd',
      name: 'Upper Other User',
      user: { connect: { id: 'u2' } },
    })
    await repository.archive('c')
    sut = new FetchUserWorkoutsUseCase(repository)
  })

  it('paginates active workouts belonging to the current user', async () => {
    const result = await sut.execute({ userId: 'u1', page: 2, pageSize: 1 })
    expect(result.workouts).toHaveLength(1)
    expect(result.pagination).toMatchObject({
      page: 2,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    })
  })

  it('filters workouts by a case-insensitive name substring', async () => {
    const result = await sut.execute({ userId: 'u1', search: 'UPPER' })
    expect(result.workouts.map(({ name }) => name)).toEqual(['Upper Body'])
    expect(result.pagination.total).toBe(1)
  })

  it('uses the documented defaults and returns zero pages when no results match', async () => {
    const result = await sut.execute({ userId: 'u1', search: 'missing' })
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    })
    expect(result.workouts).toEqual([])
  })
})
