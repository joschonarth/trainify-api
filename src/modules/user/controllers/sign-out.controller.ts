import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeSignOutUseCase } from '@/modules/user/use-cases/factories/make-sign-out-use-case'
import {
  clearAuthCookie,
  REFRESH_TOKEN_COOKIE_PATH,
} from '@/modules/user/utils/auth-cookie'

export async function signOutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const signOutUseCase = makeSignOutUseCase()

  await signOutUseCase.execute({ userId: request.user.sub })

  clearAuthCookie(reply, 'token')
  clearAuthCookie(reply, 'refreshToken', REFRESH_TOKEN_COOKIE_PATH)

  return reply.status(200).send()
}
