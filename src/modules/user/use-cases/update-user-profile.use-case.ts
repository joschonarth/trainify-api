import { User } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { UsersRepository } from '@/modules/user/repositories/users.repository'

interface UpdateUserProfileUseCaseRequest {
  userId: string
  name?: string
  age?: number
  height?: number
  weight?: number
}

interface UpdateUserProfileUseCaseResponse {
  user: User
}

export class UpdateUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    name,
    age,
    height,
    weight,
  }: UpdateUserProfileUseCaseRequest): Promise<UpdateUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const updatedUser = await this.usersRepository.update(
      userId,
      Object.fromEntries(
        Object.entries({ name, age, height, weight }).filter(
          ([, value]) => value !== undefined,
        ),
      ),
    )

    return {
      user: updatedUser,
    }
  }
}
