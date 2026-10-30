import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { SignOutUseCase } from '../sign-out.use-case'

export function makeSignOutUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const signOutUseCase = new SignOutUseCase(usersRepository)

  return signOutUseCase
}
