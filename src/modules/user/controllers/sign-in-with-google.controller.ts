import type { FastifyReply, FastifyRequest } from 'fastify'

import { env } from '@/env'
import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'
import { makeSignInWithGoogleUseCase } from '@/modules/user/use-cases/factories/make-sign-in-with-google-use-case'
import type { SignInWithGoogleBody } from '../schemas/sign-in-with-google.schema'

export async function signInWithGoogleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { token } = request.body as SignInWithGoogleBody

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
      }
    )

    reply.setCookie('token', tokenJwt, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
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
