import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { RegisterUseCase } from '../register.use-case'

export function makeRegisterUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const registerUseCase = new RegisterUseCase(usersRepository)

  return registerUseCase
}
