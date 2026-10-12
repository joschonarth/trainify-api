import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import type { RefreshTokenVerifier } from '../refresh-token.use-case'

import { RefreshTokenUseCase } from '../refresh-token.use-case'

export function makeRefreshTokenUseCase(tokenVerifier: RefreshTokenVerifier) {
  const usersRepository = new PrismaUsersRepository()
  const refreshTokenUseCase = new RefreshTokenUseCase(
    usersRepository,
    tokenVerifier
  )

  return refreshTokenUseCase
}
