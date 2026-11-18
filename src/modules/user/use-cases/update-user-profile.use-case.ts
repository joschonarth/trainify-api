import type { User } from 'generated/prisma'

import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface UpdateUserProfileUseCaseRequest {
  userId: string
  timezone?: string
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
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
    timezone,
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
          timezone,
          height,
          weight,
          gender,
          birthdate,
        }).filter(([, value]) => value !== undefined)
      )
    )

    return { user: updatedUser }
  }
}
