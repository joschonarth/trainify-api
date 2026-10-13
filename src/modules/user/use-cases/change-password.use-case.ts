import { compare, hash } from 'bcrypt'
import type { User } from 'generated/prisma'
import { PasswordChangeRejectedError } from '@/modules/user/errors/password-change-rejected.error'
import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface ChangePasswordUseCaseRequest {
  userId: string
  currentPassword: string
  newPassword: string
  passwordConfirmation: string
}

interface ChangePasswordUseCaseResponse {
  user: User
}

export class ChangePasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
    passwordConfirmation,
  }: ChangePasswordUseCaseRequest): Promise<ChangePasswordUseCaseResponse> {
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
      throw new PasswordChangeRejectedError(
        'Password changes are not available for accounts using Google sign-in.'
      )
    }

    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new PasswordChangeRejectedError('Current password is incorrect.')
    }

    if (await compare(newPassword, user.password)) {
      throw new PasswordChangeRejectedError(
        'The new password must be different from the current password.'
      )
    }

    const hashedPassword = await hash(newPassword, 12)

    const updatedUser = await this.usersRepository.update(userId, {
      password: hashedPassword,
      tokenVersion: { increment: 1 },
    })

    return { user: updatedUser }
  }
}
