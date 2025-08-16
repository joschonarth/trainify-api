import { hash } from 'bcrypt'

import { UserAlreadyExistsError } from '@/errors/user-already-exists.error'
import { UsersRepository } from '@/repositories/users.repository'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ name, email, password }: RegisterUseCaseRequest) {
    const passwordHash = await hash(password, 6)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    await this.usersRepository.create({
      name,
      email,
      password: passwordHash,
    })
  }
}
