import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeSignOutUseCase } from '@/modules/user/use-cases/factories/make-sign-out-use-case'
import { clearAuthCookie } from '@/modules/user/utils/auth-cookie'

export async function signOutController(
  _: FastifyRequest,
  reply: FastifyReply
) {
  const signOutUseCase = makeSignOutUseCase()

  await signOutUseCase.execute()

  clearAuthCookie(reply, 'token')
  clearAuthCookie(reply, 'refreshToken')

  return reply.status(200).send()
}
