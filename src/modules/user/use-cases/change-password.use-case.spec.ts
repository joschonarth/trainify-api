import { compare } from 'bcrypt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { ChangePasswordUseCase } from './change-password.use-case'

let usersRepository: InMemoryUsersRepository
let sut: ChangePasswordUseCase

describe('Change Password Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ChangePasswordUseCase(usersRepository)
  })

  it('should update the password when the current password is valid', async () => {
    const user = await makeUser(usersRepository, {
      rawPassword: 'current-password',
    })

    await sut.execute({
      userId: user.id,
      currentPassword: 'current-password',
      newPassword: 'new-secure-password',
      passwordConfirmation: 'new-secure-password',
    })

    const updatedUser = await usersRepository.findById(user.id)
    await expect(
      compare('new-secure-password', updatedUser?.password ?? '')
    ).resolves.toBe(true)
  })

  it('should reject a missing user', async () => {
    await expect(
      sut.execute({
        userId: 'missing-user',
        currentPassword: 'current-password',
        newPassword: 'new-secure-password',
        passwordConfirmation: 'new-secure-password',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should reject a mismatching confirmation before reading the user', async () => {
    const findById = vi.spyOn(usersRepository, 'findById')

    await expect(
      sut.execute({
        userId: 'missing-user',
        currentPassword: 'current-password',
        newPassword: 'new-secure-password',
        passwordConfirmation: 'different-password',
      })
    ).rejects.toBeInstanceOf(PasswordsDoNotMatchError)

    expect(findById).not.toHaveBeenCalled()
  })

  it('should reject an incorrect current password', async () => {
    const user = await makeUser(usersRepository, {
      rawPassword: 'current-password',
    })

    await expect(
      sut.execute({
        userId: user.id,
        currentPassword: 'incorrect-password',
        newPassword: 'new-secure-password',
        passwordConfirmation: 'new-secure-password',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should reject a Google-only user', async () => {
    const user = await makeUser(usersRepository, { password: null })

    await expect(
      sut.execute({
        userId: user.id,
        currentPassword: 'current-password',
        newPassword: 'new-secure-password',
        passwordConfirmation: 'new-secure-password',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should reject reusing the current password', async () => {
    const user = await makeUser(usersRepository, {
      rawPassword: 'current-password',
    })

    await expect(
      sut.execute({
        userId: user.id,
        currentPassword: 'current-password',
        newPassword: 'current-password',
        passwordConfirmation: 'current-password',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
