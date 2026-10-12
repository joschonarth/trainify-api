import type { FastifyReply } from 'fastify'

import { env } from '@/env'

export const REFRESH_TOKEN_COOKIE_PATH = '/token/refresh'

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
  maxAge = 15 * 60,
  path = '/'
) {
  return reply.setCookie(cookieName, token, {
    ...authCookieOptions,
    maxAge,
    path,
  })
}

export function clearAuthCookie(
  reply: FastifyReply,
  cookieName: string,
  path = '/'
) {
  return reply.clearCookie(cookieName, {
    ...authCookieOptions,
    maxAge: 0,
    path,
  })
}
