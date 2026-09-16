import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '@/env'

export async function refreshTokenController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify({ onlyCookie: true })
  } catch {
    return reply.status(401).send({
      message: 'Invalid or expired refresh token.',
    })
  }

  const { sub, userId, email } = request.user

  const token = await reply.jwtSign(
    {
      userId,
      email,
    },
    {
      sign: {
        sub,
      },
    }
  )

  const refreshToken = await reply.jwtSign(
    {
      userId,
      email,
    },
    {
      sign: {
        sub,
        expiresIn: '7d',
      },
    }
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    .status(200)
    .send({
      token,
    })
}
