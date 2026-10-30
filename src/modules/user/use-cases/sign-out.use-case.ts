import type { UsersRepository } from '@/modules/user/repositories/users.repository'

interface SignOutUseCaseRequest {
  userId: string
}

export class SignOutUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: SignOutUseCaseRequest): Promise<void> {
    await this.usersRepository.update(userId, {
      tokenVersion: { increment: 1 },
    })
  }
}
