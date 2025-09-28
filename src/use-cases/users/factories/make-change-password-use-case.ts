import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users.repository'

import { ChangePasswordUseCase } from '../change-password.use-case'

export function makeChangePasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const changePasswordUseCase = new ChangePasswordUseCase(usersRepository)

  return changePasswordUseCase
}
