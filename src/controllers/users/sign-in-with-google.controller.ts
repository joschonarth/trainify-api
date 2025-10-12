import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { env } from '@/env'
import { InvalidGoogleTokenError } from '@/errors/invalid-google-token.error'
import { makeSignInWithGoogleUseCase } from '@/use-cases/users/factories/make-sign-in-with-google-use-case'

export async function signInWithGoogleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({ token: z.string() })
  const { token } = bodySchema.parse(request.body)

  try {
    const signInWithGoogleUseCase = makeSignInWithGoogleUseCase()

    const { user } = await signInWithGoogleUseCase.execute({ token })

    const tokenJwt = await reply.jwtSign(
      {
        userId: user.id,
        email: user.email,
      },
      {
        sign: {
          sub: user.id,
        },
      },
    )

    reply.setCookie('token', tokenJwt, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token: tokenJwt,
    })
  } catch (error) {
    if (error instanceof InvalidGoogleTokenError) {
      return reply.status(401).send({
        message: error.message,
      })
    }

    throw error
  }
}
