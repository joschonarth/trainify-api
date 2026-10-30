import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'

import { SignOutUseCase } from './sign-out.use-case'

let usersRepository: InMemoryUsersRepository
let sut: SignOutUseCase

describe('Sign Out Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new SignOutUseCase(usersRepository)
  })

  it('should increment the tokenVersion of the user', async () => {
    const user = await makeUser(usersRepository)

    await sut.execute({ userId: user.id })

    const updated = await usersRepository.findById(user.id)
    expect(updated?.tokenVersion).toBe(user.tokenVersion + 1)
  })
})
