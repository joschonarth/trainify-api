import { User } from '@prisma/client'
import { compare } from 'bcrypt'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { UsersRepository } from '@/modules/user/repositories/users.repository'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (!user.password) {
      throw new InvalidCredentialsError(
        'Use Google login to log into this account.',
      )
    }

    const doestPasswordMatches = await compare(password, user.password)

    if (!doestPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    return {
      user,
    }
  }
}
