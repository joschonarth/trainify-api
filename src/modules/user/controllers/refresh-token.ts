import type { FastifyReply, FastifyRequest } from 'fastify'
import { setAuthCookie } from '@/modules/user/utils/auth-cookie'

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

  const token = await reply.jwtSign(
    { email, type: 'access' },
    { sign: { sub, expiresIn: '15m' } }
  )

  const refreshToken = await reply.jwtSign(
    { email, type: 'refresh' },
    {
      sign: {
        sub,
        expiresIn: '7d',
      },
    }
  )

  setAuthCookie(reply, token)
  setAuthCookie(reply, refreshToken, 'refreshToken', 7 * 24 * 60 * 60)

  return reply.status(200).send({ token })
}
