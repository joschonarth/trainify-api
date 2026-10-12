import { compare, hash } from 'bcrypt'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface ChangePasswordUseCaseRequest {
  userId: string
  currentPassword: string
  newPassword: string
  passwordConfirmation: string
}

export class ChangePasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
    passwordConfirmation,
  }: ChangePasswordUseCaseRequest): Promise<void> {
    if (newPassword !== passwordConfirmation) {
      throw new PasswordsDoNotMatchError(
        'New password and confirmation do not match.'
      )
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (!user.password) {
      throw new InvalidCredentialsError(
        'Password changes are not available for accounts using Google sign-in.'
      )
    }

    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Current password is incorrect.')
    }

    if (await compare(newPassword, user.password)) {
      throw new InvalidCredentialsError(
        'The new password must be different from the current password.'
      )
    }

    const hashedPassword = await hash(newPassword, 12)

    await this.usersRepository.update(userId, {
      password: hashedPassword,
    })
  }
}
