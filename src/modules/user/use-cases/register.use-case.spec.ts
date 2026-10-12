import { compare } from 'bcrypt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { UserAlreadyExistsError } from '@/modules/user/errors/user-already-exists.error'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'

import { RegisterUseCase } from './register.use-case'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  it('should register a user with a normalized email and hashed password', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: '  JOHNDOE@EXAMPLE.COM ',
      password: 'secure-password',
      passwordConfirmation: 'secure-password',
    })

    expect(user.email).toBe('johndoe@example.com')
    expect(user.password).not.toBe('secure-password')
    await expect(compare('secure-password', user.password ?? '')).resolves.toBe(
      true
    )
  })

  it('should reject passwords that do not match', async () => {
    await expect(
      sut.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'secure-password',
        passwordConfirmation: 'different-password',
      })
    ).rejects.toBeInstanceOf(PasswordsDoNotMatchError)
  })

  it('should reject an email that already exists', async () => {
    await makeUser(usersRepository, { email: 'johndoe@example.com' })

    await expect(
      sut.execute({
        name: 'John Doe',
        email: ' JOHNDOE@example.com ',
        password: 'secure-password',
        passwordConfirmation: 'secure-password',
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should map a unique constraint race to UserAlreadyExistsError', async () => {
    vi.spyOn(usersRepository, 'create').mockRejectedValue(
      Object.assign(new Error('Unique constraint failed.'), { code: 'P2002' })
    )

    await expect(
      sut.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'secure-password',
        passwordConfirmation: 'secure-password',
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
