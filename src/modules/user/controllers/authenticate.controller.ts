import type { FastifyReply, FastifyRequest } from 'fastify'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { makeAuthenticateUseCase } from '@/modules/user/use-cases/factories/make-authenticate-use-case'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'
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

    const { token } = await issueAuthTokens(reply, user)

    return reply.status(200).send({
      token,
    })
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        message: error.message,
      })
    }

    throw error
  }
}
