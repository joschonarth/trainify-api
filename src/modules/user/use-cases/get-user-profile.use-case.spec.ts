import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { GetUserProfileUseCase } from './get-user-profile.use-case'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })

  it('should return the user profile', async () => {
    const createdUser = await makeUser(usersRepository, {
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const { user } = await sut.execute({ userId: createdUser.id })

    expect(user).toMatchObject({
      id: createdUser.id,
      name: 'John Doe',
      email: 'johndoe@example.com',
    })
    expect(user).not.toHaveProperty('password')
    expect(user).not.toHaveProperty('streak')
    expect(user).not.toHaveProperty('tokenVersion')
  })

  it('should not return a profile for a non-existent user', async () => {
    await expect(
      sut.execute({ userId: 'non-existent-user' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
