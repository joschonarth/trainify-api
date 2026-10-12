import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeAuthenticateUseCase } from '@/modules/user/use-cases/factories/make-authenticate-use-case'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'
import type { AuthenticateBody } from '../schemas/authenticate.schema'

export async function authenticateController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as AuthenticateBody

  const authenticateUseCase = makeAuthenticateUseCase()

  const { user } = await authenticateUseCase.execute({
    email,
    password,
  })

  const { token } = await issueAuthTokens(reply, user)

  return reply.status(200).send({ token })
}
