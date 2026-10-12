import type { FastifyReply, FastifyRequest } from 'fastify'

import { GoogleAuthProviderError } from '@/modules/user/errors/google-auth-provider.error'
import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'
import { makeSignInWithGoogleUseCase } from '@/modules/user/use-cases/factories/make-sign-in-with-google-use-case'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'
import type { SignInWithGoogleBody } from '../schemas/sign-in-with-google.schema'

export async function signInWithGoogleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { token: googleToken } = request.body as SignInWithGoogleBody

  try {
    const signInWithGoogleUseCase = makeSignInWithGoogleUseCase()

    const { user } = await signInWithGoogleUseCase.execute({
      token: googleToken,
    })

    const { token } = await issueAuthTokens(reply, user)

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token,
    })
  } catch (error) {
    if (error instanceof InvalidGoogleTokenError) {
      return reply.status(401).send({
        message: error.message,
      })
    }

    if (error instanceof GoogleAuthProviderError) {
      return reply.status(error.statusCode).send({
        message: error.message,
      })
    }

    throw error
  }
}
