import { compare, hash } from 'bcrypt'
import type { User } from 'generated/prisma'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(
      email.trim().toLowerCase()
    )

    if (!user?.password) {
      await hash(password, 12)
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatch = await compare(password, user.password)

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError()
    }

    return {
      user,
    }
  }
}
