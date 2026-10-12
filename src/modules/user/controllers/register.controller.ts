import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeRegisterUseCase } from '@/modules/user/use-cases/factories/make-register-use-case'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'
import type { RegisterBody } from '../schemas/register.schema'

export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, email, password, passwordConfirmation } =
    request.body as RegisterBody

  const registerUseCase = makeRegisterUseCase()
  const { user } = await registerUseCase.execute({
    name,
    email,
    password,
    passwordConfirmation,
  })

  const { token } = await issueAuthTokens(reply, user)

  return reply.status(201).send({ token })
}
