import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { DeleteWorkoutUseCase } from './delete-workout.use-case'

describe('DeleteWorkoutUseCase', () => {
  let repository: InMemoryWorkoutsRepository
  let sut: DeleteWorkoutUseCase

  beforeEach(async () => {
    repository = new InMemoryWorkoutsRepository()
    await repository.create({
      id: 'workout-1',
      name: 'Strength',
      user: { connect: { id: 'user-1' } },
    })
    sut = new DeleteWorkoutUseCase(repository)
  })

  it('archives an owned workout and preserves it for history', async () => {
    await sut.execute({ workoutId: 'workout-1', userId: 'user-1' })
    expect(await repository.findById('workout-1')).toBeNull()
    expect(
      (await repository.findByIdIncludingArchived('workout-1'))?.archivedAt
    ).toBeInstanceOf(Date)
    expect(await repository.findAllByUser('user-1')).toHaveLength(0)
    expect(await repository.findByIdWithDetails('workout-1')).not.toBeNull()
  })

  it('keeps repeated archive requests idempotent', async () => {
    const archive = vi.spyOn(repository, 'archive')
    await sut.execute({ workoutId: 'workout-1', userId: 'user-1' })
    const archivedAt = (await repository.findByIdIncludingArchived('workout-1'))
      ?.archivedAt
    await sut.execute({ workoutId: 'workout-1', userId: 'user-1' })
    expect(archive).toHaveBeenCalledTimes(1)
    expect(
      (await repository.findByIdIncludingArchived('workout-1'))?.archivedAt
    ).toEqual(archivedAt)
  })

  it('hides workout ownership through a not found error', async () => {
    await expect(
      sut.execute({ workoutId: 'workout-1', userId: 'other-user' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
