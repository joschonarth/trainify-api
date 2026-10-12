import type { FastifyReply } from 'fastify'

import { setAuthCookie } from './auth-cookie'

const ACCESS_TTL = '15m'
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60

interface AuthenticatedUser {
  id: string
  email: string
}

export async function issueAuthTokens(
  reply: FastifyReply,
  user: AuthenticatedUser
) {
  const token = await reply.jwtSign(
    { email: user.email, type: 'access' },
    { sign: { sub: user.id, expiresIn: ACCESS_TTL } }
  )
  const refreshToken = await reply.jwtSign(
    { email: user.email, type: 'refresh' },
    { sign: { sub: user.id, expiresIn: REFRESH_TTL_SECONDS } }
  )

  setAuthCookie(reply, token)
  setAuthCookie(reply, refreshToken, 'refreshToken', REFRESH_TTL_SECONDS)

  return { token }
}
