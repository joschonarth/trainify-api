import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { UpdateUserProfileUseCase } from '../update-user-profile.use-case'

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(usersRepository)

  return updateUserProfileUseCase
}
