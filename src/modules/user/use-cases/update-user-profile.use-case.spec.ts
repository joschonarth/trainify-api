import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { UpdateUserProfileUseCase } from './update-user-profile.use-case'

let usersRepository: InMemoryUsersRepository
let sut: UpdateUserProfileUseCase

describe('Update User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateUserProfileUseCase(usersRepository)
  })

  it('should update only the provided profile fields', async () => {
    const user = await makeUser(usersRepository, {
      height: 180,
      weight: 80,
      gender: 'other',
    })
    const birthdate = new Date('1990-05-20T00:00:00.000Z')

    const { user: updatedUser } = await sut.execute({
      userId: user.id,
      name: 'Updated name',
      birthdate,
    })

    expect(updatedUser).toMatchObject({
      id: user.id,
      name: 'Updated name',
      height: 180,
      weight: 80,
      gender: 'other',
      birthdate,
    })
  })

  it('should not update a non-existent user', async () => {
    await expect(
      sut.execute({ userId: 'non-existent-user', name: 'Updated name' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
