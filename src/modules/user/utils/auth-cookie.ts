import type { FastifyReply } from 'fastify'

import { env } from '@/env'

const authCookieOptions = {
  path: '/',
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
} as const

export function setAuthCookie(
  reply: FastifyReply,
  token: string,
  cookieName = 'token',
  maxAge = 15 * 60
) {
  return reply.setCookie(cookieName, token, {
    ...authCookieOptions,
    maxAge,
  })
}

export function clearAuthCookie(reply: FastifyReply, cookieName: string) {
  return reply.clearCookie(cookieName, {
    ...authCookieOptions,
    maxAge: 0,
  })
}
