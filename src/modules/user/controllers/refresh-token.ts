import type { FastifyReply, FastifyRequest } from 'fastify'

import { InvalidRefreshTokenError } from '@/modules/user/errors/invalid-refresh-token.error'
import { makeRefreshTokenUseCase } from '@/modules/user/use-cases/factories/make-refresh-token-use-case'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'

export async function refreshTokenController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const refreshTokenCookie = request.cookies.refreshToken

  if (!refreshTokenCookie) {
    throw new InvalidRefreshTokenError()
  }

  const refreshTokenUseCase = makeRefreshTokenUseCase({
    verify: (token) => request.server.jwt.verify(token),
  })
  const { user } = await refreshTokenUseCase.execute({
    token: refreshTokenCookie,
  })
  const { token } = await issueAuthTokens(reply, user)

  return reply.status(200).send({ token })
}
