import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { env } from '@/env'
import { InvalidCredentialsError } from '@/errors/invalid-credentials.error'
import { makeAuthenticateUseCase } from '@/use-cases/users/factories/make-authenticate-use-case'

export async function authenticateController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.email(),
    password: z.string().min(6),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)

  try {
    const authenticateUseCase = makeAuthenticateUseCase()

    const { user } = await authenticateUseCase.execute({
      email,
      password,
    })

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )

    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
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
