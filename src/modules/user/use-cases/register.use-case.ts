import { hash } from 'bcrypt'
import type { User } from 'generated/prisma'

import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { UserAlreadyExistsError } from '@/modules/user/errors/user-already-exists.error'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
    passwordConfirmation,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    if (password !== passwordConfirmation) {
      throw new PasswordsDoNotMatchError()
    }

    const normalizedEmail = email.trim().toLowerCase()
    const userWithSameEmail =
      await this.usersRepository.findByEmail(normalizedEmail)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const passwordHash = await hash(password, 12)

    let user: User
    try {
      user = await this.usersRepository.create({
        name,
        email: normalizedEmail,
        password: passwordHash,
      })
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new UserAlreadyExistsError()
      }

      throw error
    }

    return { user }
  }
}
