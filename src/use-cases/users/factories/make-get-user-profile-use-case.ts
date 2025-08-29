import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users.repository'

import { GetUserProfileUseCase } from '../get-user-profile.use-case'

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new GetUserProfileUseCase(usersRepository)

  return useCase
}
