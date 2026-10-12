import { beforeEach, describe, expect, it } from 'vitest'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'

import { AuthenticateUseCase } from './authenticate.use-case'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })

  it('should be able to authenticate with valid credentials', async () => {
    await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      rawPassword: '123456',
    })

    const { user } = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
    expect(user.email).toBe('johndoe@example.com')
  })

  it('should not be able to authenticate with a non-existent email', async () => {
    await expect(
      sut.execute({
        email: 'johndoe@example.com',
        password: '123456',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with a wrong password', async () => {
    await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      rawPassword: '123456',
    })

    await expect(
      sut.execute({
        email: 'johndoe@example.com',
        password: 'wrong-password',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate a Google-only user with a password', async () => {
    await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      password: null,
    })

    await expect(
      sut.execute({
        email: 'johndoe@example.com',
        password: '123456',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should normalize the email before looking up the user', async () => {
    await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      rawPassword: '123456',
    })

    const { user } = await sut.execute({
      email: '  JOHNDOE@EXAMPLE.COM  ',
      password: '123456',
    })

    expect(user.email).toBe('johndoe@example.com')
  })
})
