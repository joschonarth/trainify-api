import { compare, hash } from 'bcrypt'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { UsersRepository } from '@/modules/user/repositories/users.repository'

interface ChangePasswordUseCaseRequest {
  userId: string
  currentPassword: string
  newPassword: string
  passwordConfirmation: string
}

export class ChangePasswordUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
    passwordConfirmation,
  }: ChangePasswordUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (!user.password) {
      throw new InvalidCredentialsError(
        'This user does not have a password set. Please sign in with Google or set a password first.',
      )
    }

    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Current password is incorrect.')
    }

    if (newPassword !== passwordConfirmation) {
      throw new PasswordsDoNotMatchError(
        'New password and confirmation do not match.',
      )
    }

    const hashedPassword = await hash(newPassword, 6)

    await this.usersRepository.update(userId, {
      password: hashedPassword,
    })
  }
}
