import { User } from '@prisma/client'

import { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface UpdateUserProfileUseCaseRequest {
  userId: string
  name?: string
  height?: number
  weight?: number
  gender?: string
  birthdate?: Date
}

interface UpdateUserProfileUseCaseResponse {
  user: User
}

export class UpdateUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    name,
    height,
    weight,
    gender,
    birthdate,
  }: UpdateUserProfileUseCaseRequest): Promise<UpdateUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const updatedUser = await this.usersRepository.update(
      userId,
      Object.fromEntries(
        Object.entries({
          name,
          height,
          weight,
          gender,
          birthdate,
        }).filter(([, value]) => value !== undefined),
      ),
    )

    return { user: updatedUser }
  }
}
