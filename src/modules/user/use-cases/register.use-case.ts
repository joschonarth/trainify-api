import { User } from '@prisma/client'
import { hash } from 'bcrypt'

import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { UserAlreadyExistsError } from '@/modules/user/errors/user-already-exists.error'
import { UsersRepository } from '@/modules/user/repositories/users.repository'

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
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
    passwordConfirmation,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    if (password !== passwordConfirmation) {
      throw new PasswordsDoNotMatchError()
    }

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const passwordHash = await hash(password, 6)

    const user = await this.usersRepository.create({
      name,
      email,
      password: passwordHash,
    })

    return {
      user,
    }
  }
}
