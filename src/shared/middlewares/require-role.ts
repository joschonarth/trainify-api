import type { FastifyRequest } from 'fastify'
import type { UserRole } from 'generated/prisma'

import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'
import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { UnauthorizedError } from '@/shared/errors/unauthorized.error'

export function requireRole(...allowedRoles: UserRole[]) {
  return async function verifyRole(request: FastifyRequest) {
    const userId = request.user?.sub

    if (!userId || request.user?.type !== 'access') {
      throw new UnauthorizedError()
    }

    const usersRepository = new PrismaUsersRepository()
    const user = await usersRepository.findById(userId)

    if (!user) {
      throw new UnauthorizedError()
    }

    if (!allowedRoles.includes(user.role)) {
      throw new NotAllowedError()
    }
  }
}
