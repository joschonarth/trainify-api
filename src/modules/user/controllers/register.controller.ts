import type { FastifyReply, FastifyRequest } from 'fastify'

import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { UserAlreadyExistsError } from '@/modules/user/errors/user-already-exists.error'
import { makeRegisterUseCase } from '@/modules/user/use-cases/factories/make-register-use-case'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'
import type { RegisterBody } from '../schemas/register.schema'

export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, email, password, passwordConfirmation } =
    request.body as RegisterBody

  try {
    const registerUseCase = makeRegisterUseCase()
    const { user } = await registerUseCase.execute({
      name,
      email,
      password,
      passwordConfirmation,
    })

    const { token } = await issueAuthTokens(reply, user)

    return reply.status(201).send({ token })
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({
        message: error.message,
      })
    }

    if (error instanceof PasswordsDoNotMatchError) {
      return reply.status(400).send({
        message: error.message,
      })
    }

    throw error
  }
}
