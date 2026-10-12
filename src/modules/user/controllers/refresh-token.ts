import type { FastifyReply, FastifyRequest } from 'fastify'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'

export async function refreshTokenController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const refreshTokenCookie = request.cookies.refreshToken

  if (!refreshTokenCookie) {
    return reply.status(401).send({
      message: 'Invalid or expired refresh token.',
    })
  }

  let refreshTokenPayload: {
    sub: string
    email: string
    type: 'access' | 'refresh'
  }
  try {
    refreshTokenPayload = request.server.jwt.verify(refreshTokenCookie)
  } catch {
    return reply.status(401).send({
      message: 'Invalid or expired refresh token.',
    })
  }

  if (
    refreshTokenPayload.type !== 'refresh' ||
    !refreshTokenPayload.sub ||
    !refreshTokenPayload.email
  ) {
    return reply.status(401).send({
      message: 'Invalid or expired refresh token.',
    })
  }

  const { sub, email } = refreshTokenPayload
  const { token } = await issueAuthTokens(reply, { id: sub, email })

  return reply.status(200).send({ token })
}
