import type { FastifyReply, FastifyRequest } from 'fastify'

import { env } from '@/env'
import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { makeAuthenticateUseCase } from '@/modules/user/use-cases/factories/make-authenticate-use-case'
import type { AuthenticateBody } from '../schemas/authenticate.schema'

export async function authenticateController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as AuthenticateBody

  try {
    const authenticateUseCase = makeAuthenticateUseCase()

    const { user } = await authenticateUseCase.execute({
      email,
      password,
    })

    const token = await reply.jwtSign(
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

    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
    })

    return reply.status(200).send({
      token,
    })
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(400).send({
        message: error.message,
      })
    }

    throw error
  }
}
